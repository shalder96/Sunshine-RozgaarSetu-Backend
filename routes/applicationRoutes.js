import Job from "../models/Job.js";
import mongoose from "mongoose";
import express from "express";
import Application from "../models/Application.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Apply for a job
router.post("/", authMiddleware, async (req, res) => {
  const { jobId } = req.body;
  const userId = req.user.id;

  try {
    const existing = await Application.findOne({
      jobId,
      workerId: userId,
    });

    if (existing) {
      return res.status(400).json({
        message: "You already applied for this job",
      });
    }

    const application = await Application.create({
      jobId,
      workerId: userId,
    });

    const job = await Job.findById(jobId);

    await Notification.create({
      userId: job.postedBy,
      text: "You received a new job application",
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get applicants for a job

router.get("/job/:jobId", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      jobId: new mongoose.Types.ObjectId(req.params.jobId),
    }).populate("workerId", "name phone");

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applicants" });
  }
});
router.post("/", authMiddleware, async (req, res) => {
  const { jobId } = req.body;

  const userId = req.user.id;

  try {
    // prevent duplicate apply
    const existing = await Application.findOne({
      jobId,
      workerId: userId,
    });

    if (existing) {
      return res.status(400).json({ message: "Already applied" });
    }

    // create application
    const application = await Application.create({
      jobId,
      workerId: userId,
    });

    // find job
    const job = await Job.findById(jobId);

    // 🔥 SEND REAL-TIME NOTIFICATION
    req.io.to(job.postedBy.toString()).emit("newNotification", {
      text: "New application received 🚀",
    });

    res.json(application);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      workerId: req.user.id,
    })
      .populate({
        path: "jobId",
        populate: {
          path: "postedBy",
          select: "name phone",
        },
      })
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching applications",
    });
  }
});
// Delete an application (withdraw)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    console.log("PARAM ID:", req.params.id);
    console.log("USER ID:", req.user.id);

    // CHECK BEFORE DELETE
    const existing = await Application.findById(req.params.id);

    console.log("FOUND APPLICATION:", existing);

    const deletedApplication = await Application.findOneAndDelete({
      _id: req.params.id,
      workerId: req.user.id,
    });

    console.log("DELETED:", deletedApplication);

    if (!deletedApplication) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    res.json({
      message: "Application withdrawn successfully",
    });
  } catch (err) {
    console.log("DELETE ERROR:", err);

    res.status(500).json({
      message: "Error deleting application",
    });
  }
});

export default router;
