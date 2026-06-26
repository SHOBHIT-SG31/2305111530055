/**
 * Logging Middleware — Public API
 *
 * Usage:
 *   const { Log, initLogger } = require("logging-middleware");
 *
 *   // Initialize with your auth token (do this once at app startup)
 *   initLogger({ token: "your-bearer-token-here" });
 *
 *   // Then use Log() anywhere in your app
 *   Log("backend", "info", "server", "Server started on port 3000");
 *   Log("backend", "error", "handler", "Failed to fetch user by ID");
 */

const { Log, initLogger } = require("./logger");

module.exports = {
  Log,
  initLogger,
};
