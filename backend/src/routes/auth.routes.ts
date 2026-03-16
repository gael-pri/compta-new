import { Router } from "express";

export const authRoutes = Router();

authRoutes.post("/logout", (req, res) => {
  console.log("Route /logout appelée");
  res.clearCookie("auth_token", { path: "/" });
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Déconnexion réussie" });
});
