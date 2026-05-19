import express from "express";
import multer from "multer";
import { register, login } from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { storage } from "../config/cloudinary.js";

const router = express.Router();

// Cloudinary upload middleware
const upload = multer({
  storage,
});

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Upload profile photo
router.put(
  "/upload-photo",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Cloudinary image URL
      user.profilePic = req.file.path;

      await user.save();

      res.json(user);
    } catch (err) {
      console.log("UPLOAD ERROR:", err);

      res.status(500).json({
        message: err.message,
        error: err,
      });
    }
  },
);

export default router;
