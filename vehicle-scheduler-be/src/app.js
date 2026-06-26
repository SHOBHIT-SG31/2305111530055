// Express app setup
const express = require("express");
const { Log } = require("logging-middleware");
const scheduleRouter = require("./routes/schedule");

const app = express();
app.use(express.json());

// request logging middleware
app.use((req, res, next) => {
  Log("backend", "info", "handler", `${req.method} ${req.url}`);
  next();
});

// routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "vehicle-scheduler" });
});

app.use("/schedule", scheduleRouter);

// 404 handler
app.use((req, res) => {
  Log("backend", "warn", "handler", `404: ${req.url}`);
  res.status(404).json({ error: "Route not found" });
});

// error handler
app.use((err, req, res, next) => {
  Log("backend", "error", "handler", `Unhandled error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
