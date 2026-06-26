/**
 * Core logging module.
 *
 * Handles the actual log sending — validates inputs, prints to console
 * for local debugging, and fires off a POST request to the evaluation
 * server in the background.
 */

const http = require("http");
const { LOG_API_URL, VALID_LEVELS, LEVEL_COLORS, RESET_COLOR } = require("./config");

// Store the auth token here after initLogger() is called
let authToken = null;

/**
 * Initialize the logger with a Bearer token.
 * Must be called before using Log() so that API requests are authenticated.
 *
 * @param {Object} options
 * @param {string} options.token - Bearer token from the auth API
 */
function initLogger(options = {}) {
  if (!options.token) {
    console.warn("[Logger] Warning: No token provided. API calls will fail.");
    return;
  }

  authToken = options.token;
  console.log("[Logger] Initialized successfully.");
}

/**
 * Send a structured log entry to the evaluation server.
 *
 * This function is designed to be non-blocking — it fires the HTTP request
 * and doesn't wait for a response, so it won't slow down your main app.
 * Errors during sending are caught and printed to console instead of
 * crashing the application.
 *
 * @param {string} stack   - The application layer (e.g., "backend", "frontend", "db")
 * @param {string} level   - Log severity: "info", "warn", "error", "fatal", "debug"
 * @param {string} pkg     - The module or package where the log originated
 * @param {string} message - A descriptive message about what happened
 */
function Log(stack, level, pkg, message) {
  // --- Input validation ---
  if (!stack || !level || !pkg || !message) {
    console.error("[Logger] All parameters are required: stack, level, package, message");
    return;
  }

  // Normalize level to lowercase for consistency
  const normalizedLevel = level.toLowerCase();

  if (!VALID_LEVELS.includes(normalizedLevel)) {
    console.error(
      `[Logger] Invalid level "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`
    );
    return;
  }

  // --- Print to console for local debugging ---
  printToConsole(stack, normalizedLevel, pkg, message);

  // --- Send to the evaluation server ---
  if (!authToken) {
    console.warn("[Logger] No auth token set. Call initLogger({ token }) first.");
    return;
  }

  sendToServer(stack, normalizedLevel, pkg, message);
}

/**
 * Pretty-print the log to the terminal with color coding.
 * Useful during development — you can see logs without checking the server.
 */
function printToConsole(stack, level, pkg, message) {
  const color = LEVEL_COLORS[level] || "";
  const timestamp = new Date().toISOString();

  console.log(
    `${color}[${timestamp}] [${level.toUpperCase()}] [${stack}/${pkg}]${RESET_COLOR} ${message}`
  );
}

/**
 * Fire a POST request to the evaluation server with the log data.
 * This runs asynchronously and won't block the calling code.
 *
 * If the request fails, we just log the error to console —
 * we don't want logging failures to crash the app.
 */
function sendToServer(stack, level, pkg, message) {
  const payload = JSON.stringify({
    stack,
    level,
    package: pkg,
    message,
  });

  // Parse the API URL to get hostname, port, and path
  const url = new URL(LOG_API_URL);

  const requestOptions = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      Authorization: `Bearer ${authToken}`,
    },
  };

  const req = http.request(requestOptions, (res) => {
    let responseData = "";

    res.on("data", (chunk) => {
      responseData += chunk;
    });

    res.on("end", () => {
      if (res.statusCode >= 400) {
        console.error(
          `[Logger] Server returned ${res.statusCode}: ${responseData}`
        );
      }
    });
  });

  // If the request itself fails (network error, etc.), just log it
  req.on("error", (err) => {
    console.error(`[Logger] Failed to send log: ${err.message}`);
  });

  req.write(payload);
  req.end();
}

module.exports = {
  Log,
  initLogger,
};
