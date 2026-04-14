const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const logger = require("./services/logger");
const errorHandler = require("./middleware/errorHandler");
const metrics = require("./middleware/metrics");
const resumeRoutes = require("./routes/resumeRoutes");
const matchRoutes = require("./routes/matchRoutes");
const jobRoutes = require("./routes/jobRoutes");
const recommendationRoutes = require("./routes/recommendRoutes");
const authMiddleware = require("./middleware/auth");

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(metrics.metricsMiddleware);
app.get("/metrics", async (_, res) => {
  res.set("Content-Type", metrics.register.contentType);
  res.send(await metrics.register.metrics());
});
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

const API_PREFIX = "/api/v1";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many uploads, try again later.",
});
const matchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many matching requests.",
});
app.use("/api", limiter);
app.use(`${API_PREFIX}/resume/upload-resume`, uploadLimiter);
app.use(`${API_PREFIX}/resume`, resumeRoutes);
app.use(`${API_PREFIX}/match`, matchRoutes);
app.use(`${API_PREFIX}/match`, matchLimiter);
app.use(`${API_PREFIX}/jobs`, jobRoutes);
app.use(`${API_PREFIX}/recommendations`, recommendationRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use(errorHandler);

module.exports = app;
