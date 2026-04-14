const pool = require("../config/db");

exports.track = async ({ userId = null, resumeId = null, jobId = null, action, metadata = null }) => {
  if (!action) return;
  try {
    await pool.query(
      `INSERT INTO user_activity (user_id, resume_id, job_id, action, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, resumeId, jobId, action, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    console.warn("Activity log failed", err.message);
  }
};
