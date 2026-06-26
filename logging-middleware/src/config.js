/**
 * Configuration for the logging middleware.
 * Keeps all constants in one place so they're easy to update.
 */

// The test server endpoint where logs get sent
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";

// Allowed log levels — anything outside this list gets rejected
const VALID_LEVELS = ["info", "warn", "error", "fatal", "debug"];

// ANSI color codes for terminal output
// Makes it much easier to spot errors vs info when debugging locally
const LEVEL_COLORS = {
  info: "\x1b[36m",    // cyan
  debug: "\x1b[34m",   // blue
  warn: "\x1b[33m",    // yellow
  error: "\x1b[31m",   // red
  fatal: "\x1b[35m",   // magenta
};

const RESET_COLOR = "\x1b[0m";

module.exports = {
  LOG_API_URL,
  VALID_LEVELS,
  LEVEL_COLORS,
  RESET_COLOR,
};
