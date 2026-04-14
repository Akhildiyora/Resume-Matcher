const axios = require("axios");
const pool = require("../config/db");
const logger = require("../services/logger");
const activityService = require("../services/activityService");
const { extractUserId } = require("../utils/requestHelpers");
const faissService = require("../services/faissService");
const realtimeService = require("../services/realtimeService");

const NLP_API = process.env.NLP_API_URL || "http://localhost:8000";

exports.getMatches = async (req, res) => {
  try {
    const { resumeId } = req.params;

    const resumeRes = await pool.query(
      "SELECT * FROM resumes WHERE id = $1",
      [resumeId]
    );
    if (!resumeRes.rowCount) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const resume = resumeRes.rows[0];

    const jobIds = await faissService.searchJobs(resume.embedding || []);
    realtimeService.emitScoreUpdate({
      resumeId,
      stage: "match.filtered",
      progress: 70,
    });

    const jobsRes = await pool.query(
      `SELECT * FROM jobs WHERE id = ANY($1)`,
      [jobIds]
    );

    const matchRes = await axios.post(`${NLP_API}/match`, {
      resume,
      jobs: jobsRes.rows,
    });
    realtimeService.emitScoreUpdate({
      resumeId,
      stage: "match.complete",
      progress: 100,
      topScore: matchRes.data.matches?.[0]?.score || 0,
    });
    const userId = extractUserId(req);
    activityService.track({
      userId,
      resumeId,
      action: "match.request",
      metadata: { jobCandidates: jobsRes.rows.map((job) => job.id) },
    });

    res.json(matchRes.data);
  } catch (error) {
    logger.error("Matching failed", error);
    res.status(500).json({ error: "Matching failed" });
  }
};
