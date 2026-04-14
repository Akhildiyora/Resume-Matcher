const express = require("express");
const authMiddleware = require("../middleware/auth");
const { recommendJobs } = require("../controllers/recommendController");

const router = express.Router();

router.post("/", authMiddleware, recommendJobs);

module.exports = router;
