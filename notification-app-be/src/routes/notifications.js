const express = require("express");
const router = express.Router();
const { Log } = require("logging-middleware");
const { getToken } = require("../utils/auth");
const { fetchNotifications } = require("../services/apiClient");
const { getTopNotifications } = require("../services/prioritizer");

// Health check endpoint
router.get("/health", (req, res) => {
  Log("backend", "info", "handler", "GET /health request received");
  res.json({ status: "ok" });
});

// Priority inbox endpoint
router.get("/priority", async (req, res) => {
  try {
    Log("backend", "info", "handler", "GET /priority request received");

    // Fetch fresh token
    const token = await getToken();

    // Fetch notifications from evaluation server
    const notifications = await fetchNotifications(token);

    // Filter/prioritize top 10 notifications
    const topNotifications = getTopNotifications(notifications, 10);

    Log("backend", "info", "handler", "Priority inbox compiled successfully");

    res.json({
      success: true,
      totalFetched: notifications.length,
      limit: 10,
      notifications: topNotifications,
    });
  } catch (error) {
    Log("backend", "error", "handler", `Priority route failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
