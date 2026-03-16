import express, { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { uploadProfileImage } from "../modules/uploads/uploadProfileImage";
import { AppDataSource } from "../ormconfig";
import { Profile } from "../entities/Profile";

export const uploadRoutes = Router();

uploadRoutes.post("/upload-profile-image/:id",
    uploadProfileImage as unknown as express.RequestHandler, async (req: Request, res: Response) => {
    try {
        const profileId = req.params.id;
        if (!profileId) {
          return res.status(400).json({ message: "Profile ID is required" });
        }

        const uploadedFile = req.file;
        if (!uploadedFile) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = path.join(uploadedFile.destination, uploadedFile.filename);

        // Permissions pour le serveur web
        fs.chmodSync(filePath, 0o644);

        // Mettre à jour l'URL dans le profil
        const avatarUrl = `/images/profiles/${uploadedFile.filename}`;
        await AppDataSource.manager.update(Profile, profileId, { avatar_url: avatarUrl, updated_at: new Date() });

        const existsOnDisk = fs.existsSync(filePath);

        res.status(200).json({
          message: "File uploaded successfully",
          fileName: uploadedFile.filename,
          avatarUrl,
          existsOnDisk,
          size: uploadedFile.size,
        });
    } catch (error) {
        console.error("Error handling file upload:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  }
);
