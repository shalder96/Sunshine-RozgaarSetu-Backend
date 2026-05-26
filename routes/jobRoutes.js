import express from "express";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Job [only logged-in user]
router.post("/", authMiddleware, async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user.id });
  res.json(job);
});

// 🌍 Get ALL jobs (for workers)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// Get jobs posted by logged-in employer
router.get("/my-jobs", authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find({
      postedBy: req.user.id,
    });

    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({
          jobId: job._id,
        });

        return {
          ...job.toObject(),
          applicantCount,
        };
      }),
    );

    res.json(jobsWithCount);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error fetching jobs",
    });
  }
});
// GET single job
router.get("/:id", authMiddleware, async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.json(job);
});
// Job delete function
router.delete("/:id", authMiddleware, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: "Job deleted" });
});
// Job update API
router.put("/:id", authMiddleware, async (req, res) => {
  const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updated);
});

export default router;
