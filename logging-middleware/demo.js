/**
 * Quick demo to verify the logging middleware works end-to-end.
 * 
 * Run: node demo.js
 * 
 * This will:
 * 1. Get a fresh auth token
 * 2. Send a test log to the server
 * 3. Print the full server response so you can see it worked
 */

const http = require("http");
const { Log, initLogger } = require("./src/index");

// Your credentials
const credentials = {
  email: "shobhit.gupta2023@glbajajgroup.org",
  name: "Shobhit Gupta",
  rollNo: "2305111530055",
  accessCode: "xxkJnk",
  clientID: "9780b345-87fd-4a02-b610-9b63e468f49e",
  clientSecret: "dueUBRQyqgGFgwgA",
};

// Step 1: Get a fresh token
function getToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(credentials);

    const req = http.request(
      {
        hostname: "4.224.186.213",
        path: "/evaluation-service/auth",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode === 201 || res.statusCode === 200) {
            const parsed = JSON.parse(body);
            resolve(parsed.access_token);
          } else {
            reject(new Error(`Auth failed (${res.statusCode}): ${body}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Step 2: Send a test log and show the result
async function main() {
  console.log("=== Logging Middleware Demo ===\n");

  // Get fresh token
  console.log("[1] Fetching auth token...");
  const token = await getToken();
  console.log("[1] Token received! (first 50 chars):", token.substring(0, 50) + "...\n");

  // Initialize the logger
  console.log("[2] Initializing logger...");
  initLogger({ token });

  // Send some test logs
  console.log("[3] Sending test logs to server...\n");

  Log("backend", "info", "handler", "Demo: logging middleware is working correctly");
  Log("backend", "error", "handler", "Demo: simulating an error log");
  Log("backend", "warn", "db", "Demo: database connection pool running low");

  // Wait a bit for the async HTTP calls to finish
  console.log("\n[4] Waiting for server responses...\n");
  setTimeout(() => {
    console.log("\n=== Demo complete! ===");
    console.log("If you don't see any 'Server returned 4xx' errors above, the logs were sent successfully!");
  }, 3000);
}

main().catch(console.error);
