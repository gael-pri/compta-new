import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.resolve(__dirname, "..", "..", "..", "public", "images", "profiles");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const profileId = req.params.id;
    if (!profileId) return cb(new Error("Profile ID is missing"), "");

    const ext = path.extname(file.originalname);
    // Supprime toutes les anciennes images pour cet utilisateur
    const files = fs.readdirSync(uploadsDir);
    files.forEach(f => {
      if (f.startsWith(profileId)) {
        fs.unlinkSync(path.join(uploadsDir, f));
      }
    });

    const newFileName = `${profileId}${ext}`;
    cb(null, newFileName);
  }
});

export const uploadProfileImage = multer({ storage, limits: { fileSize: 5*1024*1024 } }).single("file");
