import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  phone: {
    type: String,
    unique: true,
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
});

export default mongoose.model("User", userSchema);
