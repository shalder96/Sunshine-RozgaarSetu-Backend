import express from "express";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔥 Send message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const msg = await Message.create({
      sender: req.user.id,
      receiver: req.body.receiver,
      text: req.body.text,
    });

    res.json(msg);

  } catch (err) {
    res.status(500).json({
      message: "Error sending message",
    });
  }
});

// 🔥 Get chat history
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        {
          sender: req.user.id,
          receiver: req.params.userId,
        },
        {
          sender: req.params.userId,
          receiver: req.user.id,
        },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({
      message: "Error fetching messages",
    });
  }
});

export default router;