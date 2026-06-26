// Route handler for /schedule
const express = require("express");
const { Log } = require("logging-middleware");
const { fetchDepots, fetchVehicles } = require("../services/apiClient");
const { scheduleAllDepots } = require("../services/scheduler");
const { getToken } = require("../utils/auth");

const router = express.Router();

// GET /schedule — fetch data, run knapsack, return optimized schedule
router.get("/", async (req, res) => {
  try {
    Log("backend", "info", "handler", "GET /schedule request received");

    // get a fresh token
    const token = await getToken();

    // fetch data from the eval server
    const [depots, vehicles] = await Promise.all([
      fetchDepots(token),
      fetchVehicles(token),
    ]);

    // run the scheduling algorithm
    const schedule = scheduleAllDepots(depots, vehicles);

    Log("backend", "info", "handler", "Schedule computed successfully");

    res.json({
      success: true,
      totalDepots: depots.length,
      totalVehicles: vehicles.length,
      schedule: schedule,
    });
  } catch (err) {
    Log("backend", "error", "handler", `Schedule failed: ${err.message}`);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
