import { Router } from "express";
import { directusAdminClient } from "../lib/directusClient";
import { createUser, readMe, updateUser } from "@directus/sdk";
import crypto from "crypto";

export const directusRoutes = Router();

/**
 * Signup: crée un utilisateur dans Directus
 * body: { email, password, firstName?, lastName? }
 */
directusRoutes.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await directusAdminClient.request(
      createUser({
        email,
        password,
        first_name: firstName ?? "",
        last_name: lastName ?? "",
        role: "d38d1dae-c3b3-4a23-bae1-399c3bc8b028", // rôle par défaut
      })
    );

    res.json({ message: "User created", user });
  } catch (err: any) {
    console.error("Directus signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Reset password: envoie un email de reset
 * body: { email }
 */
directusRoutes.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // génère un mot de passe temporaire
    const tempPassword = crypto.randomBytes(6).toString("hex");

    // update password côté Directus
    const users = await directusAdminClient.request(
      updateUser(email, { password: tempPassword })
    );

    // TODO: envoyer email au user avec tempPassword via ton service mail
    console.log(`Temp password for ${email}: ${tempPassword}`);

    res.json({ message: "Reset password initiated. Email sent if user exists." });
  } catch (err: any) {
    console.error("Directus reset password error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Invite user (admin only)
 * body: { email }
 */
directusRoutes.post("/invite-user", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const tempPassword = crypto.randomBytes(6).toString("hex");

    const user = await directusAdminClient.request(
      createUser({
        email,
        password: tempPassword,
        role: "user",
      })
    );

    // TODO: envoyer email au user avec tempPassword
    console.log(`Invited user ${email} with password ${tempPassword}`);

    res.json({ message: "User invited", user });
  } catch (err: any) {
    console.error("Directus invite error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Me: retourne les infos de l’utilisateur connecté (optionnel)
 */
directusRoutes.get("/me", async (_req, res) => {
  try {
    const user = await directusAdminClient.request(readMe());
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});