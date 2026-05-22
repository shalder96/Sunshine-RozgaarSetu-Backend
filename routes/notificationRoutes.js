import express from "express";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ===============================
// GET NOTIFICATIONS
// ===============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error fetching notifications",
    });
  }
});

// ===============================
// GET UNREAD COUNT
// ===============================
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error fetching unread count",
    });
  }
});

// ===============================
// MARK SINGLE NOTIFICATION READ
// ===============================
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json(notification);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error updating notification",
    });
  }
});

// ===============================
// MARK ALL AS READ
// ===============================
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.json({
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error updating notifications",
    });
  }
});

export default router;
