import bcrypt from "bcryptjs";
import express from "express";
import { register, login } from "../controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";
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
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "rozgaarsetu_profiles",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(req.file.buffer);
      });

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          profilePic: result.secure_url,
        },
        { new: true },
      );

      res.json(user);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message: "Upload failed",
      });
    }
  },
);

// Forget Password Routes
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    // DEV MODE
    console.log("RESET OTP:", otp);

    res.json({
      message: "OTP generated",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    res.json({
      message: "OTP verified",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;

    await user.save();

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
