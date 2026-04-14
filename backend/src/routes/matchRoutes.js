const express = require("express");
const { getMatches } = require("../controllers/matchController");

const router = express.Router();

router.get("/:resumeId", getMatches);

module.exports = router;
