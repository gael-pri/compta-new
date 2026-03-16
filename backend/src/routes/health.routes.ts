import { Router, Request, Response } from "express";
import { AppDataSource } from "../ormconfig";

export const healthRoutes = Router();

// Logout
healthRoutes.get("/health", async (_req: Request, res: Response): Promise<void> => {
    try {
    const dbStatus = AppDataSource.isInitialized ? "connected" : "disconnected";
    res.status(200).json({ status: "ok", database: dbStatus });
    } catch (_) {
    res.status(500).json({ status: "error", database: "disconnected" });
    }
});
