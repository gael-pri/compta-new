import * as argon2 from "argon2";
import crypto from "crypto";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { User } from "../../entities/User";
import {
  CreateAccountInput,
  CreateUserInput,
  UpdateUserInput,
} from "../../inputs/UsersInput";
import { AuthPayload } from "../../types/AuthPayload";
import type { MyContext } from "../../types/context";
import { isStrongPassword, isValidEmail } from "../../utils/validators";
import { sendEmail } from "../../utils/mailgun";

@Resolver(User)
export class UsersMutations {
  
  // Login
  @Mutation(() => AuthPayload)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() context: MyContext,
  ): Promise<AuthPayload> {
    const user = await context.models.User.getByEmail(email);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }

    // Vérifier que l'email a été confirmé (avant le check password pour éviter la fuite d'info)
    if (!user.emailVerified) {
      throw new GraphQLError("Veuillez confirmer votre adresse email avant de vous connecter.", {
        extensions: { code: "EMAIL_NOT_VERIFIED" },
      });
    }

    // Vérifier si le mot de passe est correct
    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      throw new GraphQLError("Invalid password", {
        extensions: { code: "INVALID_PASSWORD" },
      });
    }

    // Générer le JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT secret is not defined");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: "24h" },
    );

    // Définir le cookie sécurisé
    context.res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return { user };
  }

  // Delete the cookie
  @Mutation(() => Boolean)
  async logout(@Ctx() context: MyContext): Promise<boolean> {
    context.res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return true;
  }

  // Mutation pour créer un nouvel utilisateur
  @Mutation(() => User)
  async createUser(
    @Arg("data", () => CreateUserInput) data: CreateUserInput,
    @Ctx() context: MyContext,
  ): Promise<User> {
    const { User: UserModel } = context.models;

    // Vérifier si un utilisateur avec cet email existe déjà
    const existingUser = await UserModel.getByEmail(data.email);
    if (existingUser) {
      throw new GraphQLError("User with this email already exists", {
        extensions: { code: "EMAIL_ALREADY_TAKEN" },
      });
    }

    if (!isValidEmail(data.email)) {
      throw new GraphQLError("Invalid email format", {
        extensions: { code: "INVALID_EMAIL" },
      });
    }

    if (!isStrongPassword(data.password)) {
      throw new GraphQLError("Password is too weak", {
        extensions: { code: "WEAK_PASSWORD" },
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await argon2.hash(data.password);

    // Créer un nouvel utilisateur
    const newUser = await UserModel.create({
      ...data,
      password: hashedPassword,
    });

    return newUser;
  }

  // Mettre à jour un utilisateur (nécessite d'être admin ou soi-même)
  @Mutation(() => User)
  async updateUser(
    @Arg("data", () => UpdateUserInput) data: UpdateUserInput,
    @Ctx() context: MyContext,
  ): Promise<User> {
    const {
      user,
      models: { User: UserModel },
    } = context;

    // Vérifier l'authentification
    if (!user) {
      throw new GraphQLError("Unauthorized", {
        extensions: { code: "UNAUTHORIZED" },
      });
    }

    // Récupérer l'utilisateur existant
    const existingUser = await UserModel.getById(data.id);
    if (!existingUser) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }

    // Vérifier que l'utilisateur peut modifier ces données
    const isAdmin = user.role === "admin";
    const isSelf = user.id === data.id;
    if (!isAdmin && !isSelf) {
      throw new GraphQLError("Permission denied", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    // Mettre à jour les champs autorisés
    const updatedUser = await UserModel.update(data.id, {
      ...data,
      password: data.password
        ? await argon2.hash(data.password)
        : existingUser.password,
    });

    return updatedUser;
  }

  // Mutation pour supprimer un utilisateur
  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id") id: number,
    @Ctx() context: MyContext,
  ): Promise<boolean> {
    const {
      user,
      models: { User: UserModel },
    } = context;

    // Vérifier l'authentification
    if (!user) {
      throw new GraphQLError("Unauthorized", {
        extensions: { code: "UNAUTHORIZED" },
      });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await UserModel.getById(id);
    if (!existingUser) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }

    // Vérifier que l'utilisateur peut supprimer ce compte
    const isAdmin = user.role === "admin";
    const isSelf = user.id === id;
    if (!isAdmin && !isSelf) {
      throw new GraphQLError("Permission denied", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    // Supprimer l'utilisateur
    await UserModel.delete(id);
    return true;
  }

  @Mutation(() => User)
  async createAccount(
    @Arg("data", () => CreateAccountInput) data: CreateAccountInput,
    @Ctx() context: MyContext,
  ): Promise<User> {
    const { User: UserModel } = context.models;

    // Vérifier si un utilisateur avec cet email existe déjà
    const existingUser = await UserModel.getByEmail(data.email);
    if (existingUser) {
      throw new GraphQLError("Email already used", {
        extensions: { code: "EMAIL_ALREADY_TAKEN" },
      });
    }

    if (!isValidEmail(data.email)) {
      throw new GraphQLError("Invalid email", {
        extensions: { code: "INVALID_EMAIL" },
      });
    }

    if (!isStrongPassword(data.password)) {
      throw new GraphQLError("Weak password", {
        extensions: { code: "WEAK_PASSWORD" },
      });
    }

    const hashedPassword = await argon2.hash(data.password);

    // Créer le profil associé
    const profile = await context.models.Profile.create({
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username || `${data.firstName}.${data.lastName}`.toLowerCase(),
    });

    // Générer le token de vérification email
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");

    const newUser = await UserModel.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: hashedPassword,
      description: "",
      image: "",
      created_at: new Date(),
      role: "user",
      birthday: null,
      gender: null,
      profileId: profile.id,
      emailVerified: false,
      emailVerifyToken,
    } as any);

    // Envoyer l'email de vérification (fire-and-forget)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:44001";
    const verifyLink = `${frontendUrl}/verify-account?token=${emailVerifyToken}`;
    sendEmail({
      to: data.email,
      subject: "Vérifiez votre adresse email — ArgoStack",
      html: buildVerifyEmailHtml(data.firstName, verifyLink),
    }).catch((err) => console.error("Erreur envoi email de vérification:", err));

    return newUser;
  }
}

function buildVerifyEmailHtml(firstName: string, verifyLink: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:12px;background:#f1f5f9;font-family:Inter,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:#2563eb;padding:24px 28px;">
      <h1 style="margin:0;font-size:20px;color:#ffffff;font-family:Poppins,sans-serif;">Bienvenue sur ArgoStack</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">Confirmez votre adresse email</p>
    </div>
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#1a1a2e;line-height:1.6;margin:0 0 16px;">
        Bonjour ${firstName},<br/>Merci de vous être inscrit ! Cliquez sur le bouton ci-dessous pour vérifier votre adresse email.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${verifyLink}" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Vérifier mon email
        </a>
      </div>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Envoyé depuis <strong>ArgoStack</strong></p>
    </div>
  </div>
</body>
</html>`;
}
