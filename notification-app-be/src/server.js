// Entry point — start the server
const app = require("./app");
const { initLogger, Log } = require("logging-middleware");
const { getToken } = require("./utils/auth");

const PORT = 3002;

async function start() {
  try {
    // get auth token and initialize the logger
    const token = await getToken();
    initLogger({ token });

    Log("backend", "info", "handler", "Logger initialized with auth token");

    app.listen(PORT, () => {
      Log("backend", "info", "handler", `Notification app running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
