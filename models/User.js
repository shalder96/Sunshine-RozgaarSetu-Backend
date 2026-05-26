import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    trim: true,
  },
  password: String,
  role: {
    type: String,
    enum: ["worker", "employer"],
  },
  profilePic: {
    type: String,
    default: "",
  },
  resetOTP: {
    type: String,
  },

  resetOTPExpire: {
    type: Date,
  },
});

export default mongoose.model("User", userSchema);
