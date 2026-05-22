import Job from "../models/Job.js";
import mongoose from "mongoose";
import express from "express";
import Application from "../models/Application.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { createNotification } from "../utils/createNotification.js";

const router = express.Router();

// APPLY JOB
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
        message: "Already applied",
      });
    }

    const application = await Application.create({
      jobId,
      workerId: userId,
    });

    const job = await Job.findById(jobId);

    // 🔔 employer notification
    await createNotification(
      req.io,
      job.postedBy,
      "New application received 🚀",
      "application",
      application._id,
    );

    res.json(application);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET APPLICANTS
router.get("/job/:jobId", authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({
      jobId: new mongoose.Types.ObjectId(req.params.jobId),
    }).populate("workerId", "name phone");

    res.json(applications);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching applicants",
    });
  }
});

// MY APPLICATIONS
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

// WITHDRAW
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const existing = await Application.findById(req.params.id).populate(
      "jobId",
    );

    if (!existing) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const deletedApplication = await Application.findOneAndDelete({
      _id: req.params.id,
      workerId: req.user.id,
    });

    if (!deletedApplication) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // 🔔 employer notification
    await createNotification(
      req.io,
      existing.jobId.postedBy,
      "Worker withdrew application",
      "withdraw",
      existing._id,
    );

    res.json({
      message: "Application withdrawn successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error deleting application",
    });
  }
});

// UPDATE STATUS (ACCEPT / REJECT)
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    const application = await Application.findById(req.params.id)
      .populate("workerId", "name")
      .populate("jobId", "title postedBy");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }
    // Only employer can update status
    if (application.jobId.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }
    // Can't update if already in desired status
    if (application.status === status) {
      return res.status(400).json({
        message: `Already ${status}`,
      });
    }

    application.status = status;
    await application.save();

    // 🔔 worker notification
    await createNotification(
      req.io,
      application.workerId._id,
      status === "accepted"
        ? `🎉 Your application for "${application.jobId.title}" has been accepted`
        : `Your application for "${application.jobId.title}" was not selected`,
      status === "accepted" ? "accepted" : "rejected",
      application._id,
    );

    res.json(application);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error updating status",
    });
  }
});
export default router;
