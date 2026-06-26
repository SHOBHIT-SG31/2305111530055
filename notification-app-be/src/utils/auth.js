// Handles fetching a fresh Bearer token from the auth API
const http = require("http");

const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";

const credentials = {
  email: "shobhit.gupta2023@glbajajgroup.org",
  name: "Shobhit Gupta",
  rollNo: "2305111530055",
  accessCode: "xxkJnk",
  clientID: "9780b345-87fd-4a02-b610-9b63e468f49e",
  clientSecret: "dueUBRQyqgGFgwgA",
};

let cachedToken = null;
let tokenExpiry = 0;

// Fetch a new token, or return cached one if still valid
function getToken() {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);

    // reuse token if it hasn't expired yet (with 30s buffer)
    if (cachedToken && now < tokenExpiry - 30) {
      return resolve(cachedToken);
    }

    const body = JSON.stringify(credentials);
    const url = new URL(AUTH_URL);

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 || res.statusCode === 201) {
              cachedToken = parsed.access_token;
              tokenExpiry = parsed.expires_in;
              resolve(cachedToken);
            } else {
              reject(new Error(`Auth failed (${res.statusCode}): ${data}`));
            }
          } catch (err) {
            reject(new Error("Failed to parse auth response"));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.write(body);
    req.end();
  });
}

module.exports = { getToken };
