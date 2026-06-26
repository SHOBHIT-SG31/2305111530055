/**
 * Basic tests for the logging middleware.
 *
 * These are simple sanity checks — not a full test suite.
 * Just making sure the core function doesn't crash and
 * handles edge cases gracefully.
 *
 * Run with: npm test
 */

const { Log, initLogger } = require("../src/index");

console.log("=== Logging Middleware Tests ===\n");

// Test 1: Log without initializing (should warn about missing token)
console.log("--- Test 1: Log without token ---");
Log("backend", "info", "test", "This should warn about missing token");
console.log("");

// Test 2: Missing parameters
console.log("--- Test 2: Missing parameters ---");
Log("backend", "error", "", "Missing package name");
Log("", "info", "test", "Missing stack");
Log("backend", "info", "test"); // missing message
console.log("");

// Test 3: Invalid log level
console.log("--- Test 3: Invalid log level ---");
Log("backend", "critical", "test", "Invalid level should be rejected");
console.log("");

// Test 4: Initialize logger and log at each level
console.log("--- Test 4: All valid log levels (console output only) ---");
// Using a dummy token — these will hit the server but get 401, which is fine for testing
initLogger({ token: "test-token-for-local-testing" });

Log("backend", "info", "server", "Application started successfully");
Log("backend", "debug", "db", "Running query: SELECT * FROM users");
Log("backend", "warn", "auth", "Token expires in 5 minutes");
Log("backend", "error", "handler", "User not found with ID: 42");
Log("backend", "fatal", "db", "Database connection lost");

console.log("\n=== All tests completed ===");
