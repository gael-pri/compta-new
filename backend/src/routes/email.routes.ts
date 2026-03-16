import { Router, Request, Response } from "express";
import crypto from "crypto";
import * as argon2 from "argon2";
import { sendEmail } from "../utils/mailgun";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";

export const emailRoutes = Router();

// =====================
// Verify Account (email confirmation)
// =====================
emailRoutes.post("/verify-account", async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };

  if (!token) {
    res.status(400).json({ error: "Token manquant" });
    return;
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { emailVerifyToken: token } });

    if (!user) {
      res.status(400).json({ error: "Lien de vérification invalide ou déjà utilisé" });
      return;
    }

    user.emailVerified = true;
    user.emailVerifyToken = null;
    await userRepo.save(user);

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur verify-account:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// =====================
// Forgot Password
// =====================
function buildResetPasswordHtml(resetLink: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:12px;background:#f1f5f9;font-family:Inter,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:#2563eb;padding:24px 28px;">
      <h1 style="margin:0;font-size:20px;color:#ffffff;font-family:Poppins,sans-serif;">Réinitialisation de mot de passe</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">ArgoStack</p>
    </div>
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#1a1a2e;line-height:1.6;margin:0 0 16px;">
        Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:0;">
        Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
      </p>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">Envoyé depuis <strong>ArgoStack</strong></p>
    </div>
  </div>
</body>
</html>`;
}

emailRoutes.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ error: "Email requis" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Email invalide" });
    return;
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    // Always return success to avoid email enumeration
    if (!user) {
      res.json({ success: true });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = token;
    user.passwordResetExpiry = expiry;
    await userRepo.save(user);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:44001";
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe — ArgoStack",
      html: buildResetPasswordHtml(resetLink),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur forgot-password:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// =====================
// Reset Password
// =====================
emailRoutes.post("/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    res.status(400).json({ error: "Token et mot de passe requis" });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    return;
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { passwordResetToken: token } });

    if (!user) {
      res.status(400).json({ error: "Lien de réinitialisation invalide" });
      return;
    }

    if (!user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      res.status(400).json({ error: "Le lien de réinitialisation a expiré" });
      return;
    }

    user.password = await argon2.hash(password);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await userRepo.save(user);

    res.json({ success: true });
  } catch (err) {
    console.error("Erreur reset-password:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
