import Notification from "../models/Notification.js";

export const createNotification = async (
  io,
  userId,
  text,
  type = "application",
  relatedId = null,
  senderId = null,
) => {
  try {
    const notification = await Notification.create({
      userId,
      senderId,
      text,
      type,
      relatedId,
    });

    const populatedNotification = await Notification.findById(
      notification._id,
    ).populate("senderId", "name");

    if (io) {
      io.to(userId.toString()).emit("newNotification", populatedNotification);
    }

    return populatedNotification;
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};
