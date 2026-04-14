const pool = require("../config/db");
const activityService = require("../services/activityService");
const faissService = require("../services/faissService");
const matchService = require("../services/matchService");
const realtimeService = require("../services/realtimeService");
const { extractUserId } = require("../utils/requestHelpers");

exports.recommendJobs = async (req, res, next) => {
  try {
    const { resumeId, limit = 5 } = req.body;
    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required" });
    }

    const resumeResult = await pool.query("SELECT * FROM resumes WHERE id = $1", [resumeId]);
    if (!resumeResult.rowCount) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const resume = resumeResult.rows[0];
    const topJobs = await faissService.searchJobs(resume.embedding || [], { k: Math.min(limit, 20) });
    const jobIds = Array.isArray(topJobs) ? topJobs : [];
    const jobs = jobIds.length
      ? (await pool.query("SELECT * FROM jobs WHERE id = ANY($1)", [jobIds])).rows
      : [];

    const matchResult = jobs.length
      ? await matchService.getMatches(resume, jobs)
      : { matches: [] };
    const jobMap = new Map(jobs.map((job) => [job.id, job]));
    const recommendations = (matchResult.matches || []).map((match) => ({
      ...match,
      job: jobMap.get(match.job_id),
    }));

    const userId = extractUserId(req);
    activityService.track({
      userId,
      resumeId,
      action: "recommendation.request",
      metadata: { jobIds, limit },
    });

    realtimeService.emitScoreUpdate({
      resumeId,
      stage: "recommendations.ready",
      recommendationCount: recommendations.length,
    });

    res.json({
      resumeId,
      recommendations,
    });
  } catch (err) {
    next(err);
  }
};
