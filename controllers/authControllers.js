import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register
// Register
export const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  try {
    // Duplicate email
    const existingEmail = await User.findOne({
      email,
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Duplicate phone
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, "secretkey", {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
