const http = require("http");

http.get("http://localhost:3001/schedule", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    const result = JSON.parse(data);
    console.log("Success:", result.success);
    console.log("Total Depots:", result.totalDepots);
    console.log("Total Vehicles:", result.totalVehicles);
    console.log("\nSchedule Summary:");
    result.schedule.forEach((s) => {
      console.log(
        "  Depot " + s.depotId + ": " + s.tasksScheduled + " tasks, impact=" + s.totalImpact + ", used " + s.usedHours + "/" + s.availableHours + "hrs"
      );
    });
  });
}).on("error", (err) => console.error(err.message));
