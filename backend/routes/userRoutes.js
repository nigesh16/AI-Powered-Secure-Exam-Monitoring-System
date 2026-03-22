import express from "express";
import User from "../models/User.js";
import { uploadProfile } from "../config/upload.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.put(
  "/update-profile",
  protect,                      
  uploadProfile.single("profilePic"),
  async (req, res) => {
    try {

      const userId = req.user._id;

      const { username } = req.body;

      const updateData = {};

      if (username) {
        updateData.username = username;
      }

      if (req.file) {
        updateData.profilePic = `/uploads/profiles/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        user
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }
  }
);

export default router;