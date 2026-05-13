import express from "express";
import { register, login } from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put(
  "/upload-photo",
  authMiddleware,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          profilePic: `http://localhost:5000/uploads/${req.file.filename}`,
        },
        { new: true },
      );

      res.json(updatedUser);
    } catch (err) {
      console.log("upload error", err);
      res.status(500).json({
        message: err.message,
      });
    }
  },
);

export default router;
