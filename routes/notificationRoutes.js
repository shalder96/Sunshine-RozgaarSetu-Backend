import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// GET notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {
    res.status(500).json({
      message: "Error fetching notifications",
    });
  }
});


// MARK AS READ
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification =
      await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );

    res.json(notification);

  } catch (err) {
    res.status(500).json({
      message: "Error updating notification",
    });
  }
});

export default router;