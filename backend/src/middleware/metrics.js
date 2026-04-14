const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"],
  registers: [register],
});

const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  const route = req.route?.path || req.path;

  res.on("finish", () => {
    const labels = {
      method: req.method,
      route,
      code: res.statusCode,
    };
    httpRequestDuration.labels(labels.method, labels.route, String(labels.code)).observe(end());
    httpRequestCounter.labels(labels.method, labels.route, String(labels.code)).inc();
  });

  next();
};

module.exports = {
  metricsMiddleware,
  register,
};
