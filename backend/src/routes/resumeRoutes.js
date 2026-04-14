const express = require("express");
const upload = require("../middleware/upload");
const nlpService = require("../services/nlpService");

const router = express.Router();

router.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Resume is required" });
  }

  const fileText = req.body.text || "";

  try {
    const result = await nlpService.processResume(fileText);
    res.json({
      message: "File uploaded",
      file: req.file,
      nlp: result,
    });
  } catch (error) {
    console.error("NLP service error", error.message);
    res.status(502).json({ message: "Failed to process resume", error: error.message });
  }
});

module.exports = router;
