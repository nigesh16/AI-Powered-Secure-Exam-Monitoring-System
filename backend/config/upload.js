import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const examId = req.params.examId || 'temp';
    const studentId = req.user?._id?.toString() || req.body?.studentId || 'unknown';
    const dir = path.join(process.cwd(), 'uploads', examId, String(studentId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const type = req.body?.eventType || file.originalname || 'cheat';
    const safeName = type.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}-${Date.now()}.png`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// PROFILE PICTURE STORAGE

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'profiles');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id?.toString() || 'user';
    cb(null, `profile-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});