/**
 * Quick client runner to test and display the priority notifications.
 * 
 * Run: node test-priority.js
 * 
 * Assumes the server is running on http://localhost:3002.
 */

const http = require("http");

console.log("=== Campus Notifications Priority Inbox Test ===");
console.log("Connecting to local backend service on port 3002...\n");

http.get("http://localhost:3002/priority", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    if (res.statusCode !== 200) {
      console.error(`Error: Server returned status code ${res.statusCode}`);
      console.error(data);
      return;
    }

    try {
      const result = JSON.parse(data);
      console.log(`Status: Success`);
      console.log(`Total Notifications Fetched from Eval Server: ${result.totalFetched}`);
      console.log(`Top ${result.notifications.length} Priority Notifications (Weight: Placement > Result > Event, sorted by newest timestamp):\n`);

      console.log("------------------------------------------------------------------------------------------------------------------");
      console.log(
        "Rank | Type (Weight) | Message                                                      | Timestamp"
      );
      console.log("------------------------------------------------------------------------------------------------------------------");

      const weights = { Placement: 3, Result: 2, Event: 1 };
      
      result.notifications.forEach((item, index) => {
        const rank = String(index + 1).padStart(2, " ");
        const typeStr = `${item.Type} [${weights[item.Type] || 0}]`.padEnd(13, " ");
        const msgStr = item.Message.padEnd(60, " ");
        const timeStr = item.Timestamp;
        console.log(`${rank}   | ${typeStr} | ${msgStr} | ${timeStr}`);
      });
      console.log("------------------------------------------------------------------------------------------------------------------");
    } catch (e) {
      console.error("Failed to parse JSON response:", e.message);
      console.log(data);
    }
  });
}).on("error", (err) => {
  console.error("Connection Failed:", err.message);
  console.log("Make sure you started the server with: npm start");
});
