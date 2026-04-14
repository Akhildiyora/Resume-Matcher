const pool = require("../config/db");
const axios = require("axios");
const Joi = require("joi");
const logger = require("../services/logger");
const faissService = require("../services/faissService");
const activityService = require("../services/activityService");
const matchService = require("../services/matchService");
const { extractUserId } = require("../utils/requestHelpers");

const NLP_API = process.env.NLP_API_URL || "http://localhost:8000";

const jobSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(20).required(),
});

const parseExperienceValue = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

exports.createJob = async (req, res, next) => {
  const { error } = jobSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const { title, description, experience: jobExperience } = req.body;
    const userId = extractUserId(req);
    const response = await axios.post(`${NLP_API}/process-text`, {
      text: description,
    });

    const { processed_text, skills: extractedSkills, embedding: jobEmbedding, tokens, experience, education, domain } = response.data;

    const result = await pool.query(
      `INSERT INTO jobs (title, description, skills, tokens, embedding, experience, education, domain)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        title,
        processed_text,
        JSON.stringify(extractedSkills || []),
        JSON.stringify(tokens || []),
        jobEmbedding || null,
        parseExperienceValue(jobExperience) ?? experience ?? null,
        education || null,
        domain || null,
      ]
    );

    if (jobEmbedding?.length) {
      await faissService.indexJobs([jobEmbedding], [result.rows[0].id]);
    }

    activityService.track({
      userId,
      jobId: result.rows[0].id,
      action: "job.create",
      metadata: {
        skills: extractedSkills,
        experience: parseExperienceValue(jobExperience) ?? experience,
      },
    });

    res.json({ jobId: result.rows[0].id });
  } catch (err) {
    logger.error("Job creation failed", err);
    next(err);
  }
};

exports.listJobs = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const filters = [];
    const params = [];

    if (req.query.location) {
      params.push(req.query.location);
      filters.push(`location = $${params.length}`);
    }
    if (req.query.experience) {
      params.push(parseExperienceValue(req.query.experience));
      filters.push(`experience <= $${params.length}`);
    }
    if (req.query.salary) {
      params.push(req.query.salary);
      filters.push(`salary_range = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const query = `SELECT * FROM jobs ${whereClause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ jobs: result.rows });
  } catch (err) {
    logger.error("List jobs failed", err);
    next(err);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    const jobId = Number(req.params.jobId);
    if (!jobId) {
      return res.status(400).json({ error: "Missing job id" });
    }

    const jobResult = await pool.query("SELECT * FROM jobs WHERE id = $1", [jobId]);
    if (!jobResult.rowCount) {
      return res.status(404).json({ error: "Job not found" });
    }

    const resumesLimit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const resumeRows = await pool.query(
      `SELECT * FROM resumes ORDER BY created_at DESC LIMIT $1`,
      [resumesLimit]
    );

    const matchResponse = await matchService.getMatches(jobResult.rows[0], resumeRows.rows);
    const resumeMap = new Map(resumeRows.rows.map((row) => [row.id, row]));
    const rankedMatches = matchResponse?.matches || [];
    const candidates = rankedMatches.map((match) => ({
      resumeId: match.job_id,
      score: match.score,
      breakdown: match.breakdown,
      matchedSkills: match.matched_skills,
      missingSkills: match.missing_skills,
      resume: resumeMap.get(match.job_id),
    }));

    const userId = extractUserId(req);
    activityService.track({
      userId,
      jobId,
      action: "recruiter.view_candidates",
      metadata: { candidateCount: candidates.length },
    });

    res.json({ jobId, candidates });
  } catch (err) {
    logger.error("Get candidates failed", err);
    next(err);
  }
};
