const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createJob, listJobs, getCandidates } = require("../controllers/jobController");

const router = express.Router();

router.post("/", authMiddleware, createJob);
router.get("/:jobId/candidates", authMiddleware, getCandidates);
router.get("/", listJobs);

module.exports = router;
