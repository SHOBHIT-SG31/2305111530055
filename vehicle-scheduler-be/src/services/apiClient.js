// Fetches depot and vehicle data from the evaluation server
const http = require("http");
const { Log } = require("logging-middleware");

const BASE_URL = "http://4.224.186.213";
const DEPOTS_PATH = "/evaluation-service/depots";
const VEHICLES_PATH = "/evaluation-service/vehicles";

// Generic GET request to the eval server
function makeGetRequest(path, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL);

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: path,
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
              resolve(JSON.parse(data));
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

// Fetch all depots from the eval server
async function fetchDepots(token) {
  Log("backend", "info", "handler", "Fetching depots from server");
  const response = await makeGetRequest(DEPOTS_PATH, token);
  Log("backend", "info", "handler", `Got ${response.depots.length} depots`);
  return response.depots;
}

// Fetch all vehicles/tasks from the eval server
async function fetchVehicles(token) {
  Log("backend", "info", "handler", "Fetching vehicles from server");
  const response = await makeGetRequest(VEHICLES_PATH, token);
  Log("backend", "info", "handler", `Got ${response.vehicles.length} vehicles`);
  return response.vehicles;
}

module.exports = { fetchDepots, fetchVehicles };
