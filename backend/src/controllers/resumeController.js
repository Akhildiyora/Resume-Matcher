const pool = require("../config/db");
const nlpService = require("../services/nlpService");
const logger = require("../services/logger");
const activityService = require("../services/activityService");
const realtimeService = require("../services/realtimeService");
const { extractUserId } = require("../utils/requestHelpers");

const computeCosineSimilarity = (a = [], b = []) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  const dot = a.reduce((acc, val, idx) => acc + (val || 0) * (b[idx] || 0), 0);
  const normA = Math.sqrt(a.reduce((acc, val) => acc + Math.pow(val || 0, 2), 0));
  const normB = Math.sqrt(b.reduce((acc, val) => acc + Math.pow(val || 0, 2), 0));
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (normA * normB);
};

const ROLE_SKILL_MAP = {
  "machine learning engineer": [
    "python",
    "machine learning",
    "data science",
    "tensorflow",
    "pytorch",
    "aws",
    "docker",
    "mlflow",
  ],
  "data scientist": [
    "python",
    "statistics",
    "pandas",
    "sql",
    "machine learning",
    "visualization",
  ],
  "software engineer": ["python", "react", "node.js", "testing", "ci/cd", "docker"],
  "devops engineer": ["terraform", "kubernetes", "docker", "aws", "monitoring"],
  default: ["communication", "teamwork", "problem solving", "python", "projects"],
};

const BASE_SUGGESTIONS = [
  "Quantify accomplishments with metrics",
  "Highlight deployments or production work",
  "Mention collaboration or leadership examples",
  "Tie every bullet point to an outcome",
];

const pickSuggestions = (missingSkills, role) => {
  const suggestions = new Set();
  if (missingSkills.length) {
    suggestions.add(`Add exposure to ${missingSkills.slice(0, 3).join(", ")}`);
  }
  suggestions.add(`Align resume sections with ${role || "the target role"}`);
  BASE_SUGGESTIONS.forEach((tip) => suggestions.add(tip));
  return Array.from(suggestions).slice(0, 4);
};

exports.uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Resume file is required" });
  }

  realtimeService.emitScoreUpdate({ stage: "upload.started", progress: 5 });

  const userId = extractUserId(req);

  try {
    const result = await nlpService.parseResume(req.file.path);
    const {
      processed_text,
      cleaned_text,
      tokens,
      skills,
      embedding,
      experience,
      education,
      domain,
      raw_text,
      skill_categories,
    } = result;

    const dbResult = await pool.query(
      `INSERT INTO resumes (raw_text, processed_text, cleaned_text, tokens, skills, skill_categories, embedding, experience, education, domain)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        raw_text,
        processed_text,
        cleaned_text,
        JSON.stringify(tokens || []),
        JSON.stringify(skills || []),
        JSON.stringify(skill_categories || {}),
        embedding || null,
        experience || 0,
        education,
        domain,
      ]
    );

    activityService.track({
      userId,
      resumeId: dbResult.rows[0].id,
      action: "resume.upload",
      metadata: {
        domain,
        education,
        skills,
      },
    });

    realtimeService.emitScoreUpdate({
      resumeId: dbResult.rows[0].id,
      stage: "upload.complete",
      progress: 100,
      domain,
    });

    return res.json({
      resumeId: dbResult.rows[0].id,
      skills,
      experience,
      education,
      domain,
      skillCategories: skill_categories,
    });
  } catch (error) {
    logger.error("Resume upload failed", error);
    return res.status(500).json({ error: "Resume upload failed" });
  }
};

exports.getResume = async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM resumes WHERE id = $1", [id]);
  if (!result.rowCount) {
    return res.status(404).json({ error: "Resume not found" });
  }
  res.json(result.rows[0]);
};

exports.compareResumes = async (req, res) => {
  const { resumeAId, resumeBId } = req.body;
  if (!resumeAId || !resumeBId) {
    return res.status(400).json({ error: "Two resume IDs are required" });
  }

  try {
    const ids = [Number(resumeAId), Number(resumeBId)].filter(Boolean);
    const result = await pool.query(
      "SELECT id, embedding FROM resumes WHERE id = ANY($1)",
      [ids]
    );

    if (result.rowCount < 2) {
      return res.status(404).json({ error: "One or more resumes not found" });
    }

    const map = new Map(result.rows.map((row) => [row.id, row.embedding]));
    const vectorA = map.get(Number(resumeAId));
    const vectorB = map.get(Number(resumeBId));
    const similarity = computeCosineSimilarity(vectorA, vectorB);

    res.json({ similarity: Number(similarity.toFixed(4)) });
  } catch (error) {
    logger.error("Resume comparison failed", error);
    res.status(500).json({ error: "Comparison failed" });
  }
};

exports.improveResume = async (req, res) => {
  const { resumeId, role, skills = [], text } = req.body;
  try {
    const resumeResult = resumeId
      ? await pool.query("SELECT * FROM resumes WHERE id = $1", [resumeId])
      : { rows: [], rowCount: 0 };

    const resume = resumeResult.rowCount ? resumeResult.rows[0] : null;
    const resumeSkills = (resume?.skills || []).map((skill) => skill.toLowerCase());
    const requestedSkills = Array.isArray(skills)
      ? skills.map((skill) => skill.toLowerCase())
      : [];
    const mergedSkills = new Set([...resumeSkills, ...requestedSkills]);
    const roleKey = (role || "default").toLowerCase();
    const targetSkills =
      ROLE_SKILL_MAP[roleKey] || ROLE_SKILL_MAP.default || ROLE_SKILL_MAP["default"];
    const missingSkills = targetSkills.filter((skill) => !mergedSkills.has(skill.toLowerCase()));
    const suggestions = pickSuggestions(missingSkills, role);

    activityService.track({
      userId: extractUserId(req),
      resumeId,
      action: "resume.improve",
      metadata: {
        role,
        missingSkills,
        textSnippet: text ? text.slice(0, 200) : null,
      },
    });

    realtimeService.emitScoreUpdate({
      resumeId,
      stage: "improve.completed",
      missingSkillsCount: missingSkills.length,
    });

    res.json({
      resumeId,
      role,
      missing_skills: missingSkills,
      suggestions,
    });
  } catch (error) {
    logger.error("Resume improvement failed", error);
    res.status(500).json({ error: "Resume improvement failed" });
  }
};
