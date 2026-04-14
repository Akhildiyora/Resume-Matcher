const Queue = require("bull");
const fs = require("fs");
const path = require("path");
const nlpService = require("./nlpService");
const pool = require("../config/db");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const resumeQueue = new Queue("resume-processing", { redis: REDIS_URL });

resumeQueue.process(async (job) => {
  const { filePath } = job.data;
  const result = await nlpService.parseResume(filePath);
  const { processed_text, cleaned_text, tokens, skills, embedding, experience, education, domain } = result;

  const dbResult = await pool.query(
    `INSERT INTO resumes (processed_text, cleaned_text, tokens, skills, embedding, experience, education, domain)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      processed_text,
      cleaned_text,
      JSON.stringify(tokens || []),
      JSON.stringify(skills || []),
      embedding || null,
      experience || 0,
      education || null,
      domain || null,
    ]
  );

  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.warn("Unable to delete temp file", err);
  }

  return {
    resumeId: dbResult.rows[0].id,
    skills,
    experience,
    education,
    domain,
  };
});

module.exports = resumeQueue;
