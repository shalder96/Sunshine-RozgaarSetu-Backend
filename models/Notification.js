import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    text: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["application", "message", "accepted", "rejected", "withdraw"],
      default: "application",
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
notificationSchema.index({
  userId: 1,
  isRead: 1,
  createdAt: -1,
});

export default mongoose.model("Notification", notificationSchema);
