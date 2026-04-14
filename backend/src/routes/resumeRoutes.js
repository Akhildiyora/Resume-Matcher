const express = require("express");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const { uploadResume, getResume, compareResumes, improveResume } = require("../controllers/resumeController");

const router = express.Router();

router.post("/upload-resume", upload.single("resume"), uploadResume);
router.get("/:id", getResume);
router.post("/compare", authMiddleware, compareResumes);
router.post("/improve-resume", authMiddleware, improveResume);

module.exports = router;
