// Fetches notification data from the evaluation server
const http = require("http");
const { Log } = require("logging-middleware");

const BASE_URL = "http://4.224.186.213";
const NOTIFICATIONS_PATH = "/evaluation-service/notifications";

// Fetch notifications from the evaluation server
function fetchNotifications(token) {
  return new Promise((resolve, reject) => {
    Log("backend", "info", "handler", "Fetching notifications from server");
    const url = new URL(BASE_URL);

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: NOTIFICATIONS_PATH,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              const parsed = JSON.parse(data);
              Log("backend", "info", "handler", `Got ${parsed.notifications.length} notifications`);
              resolve(parsed.notifications);
            } catch (err) {
              reject(new Error("Failed to parse response JSON"));
            }
          } else {
            reject(new Error(`API returned ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.end();
  });
}

module.exports = { fetchNotifications };
