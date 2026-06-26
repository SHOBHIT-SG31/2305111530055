// 0/1 Knapsack solver using dynamic programming
// Picks the best subset of tasks to maximize Impact within a given hour budget
const { Log } = require("logging-middleware");

// Solve the knapsack for a single depot
// capacity = depot's MechanicHours
// tasks = array of { TaskID, Duration, Impact }
// Returns { selectedTasks, totalImpact, totalDuration }
function solveKnapsack(capacity, tasks) {
  const n = tasks.length;

  // dp[i][w] = max impact using first i items with capacity w
  // we only need integer capacities, so this works well
  const dp = [];
  for (let i = 0; i <= n; i++) {
    dp[i] = new Array(capacity + 1).fill(0);
  }

  // fill the DP table
  for (let i = 1; i <= n; i++) {
    const task = tasks[i - 1];
    const weight = task.Duration;
    const value = task.Impact;

    for (let w = 0; w <= capacity; w++) {
      // don't take this item
      dp[i][w] = dp[i - 1][w];

      // take this item if it fits
      if (weight <= w) {
        const withItem = dp[i - 1][w - weight] + value;
        if (withItem > dp[i][w]) {
          dp[i][w] = withItem;
        }
      }
    }
  }

  // backtrack to find which tasks we picked
  const selectedTasks = [];
  let remainingCapacity = capacity;

  for (let i = n; i > 0; i--) {
    if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
      // this task was included
      selectedTasks.push(tasks[i - 1]);
      remainingCapacity -= tasks[i - 1].Duration;
    }
  }

  const totalImpact = dp[n][capacity];
  const totalDuration = capacity - remainingCapacity;

  return {
    selectedTasks,
    totalImpact,
    totalDuration,
  };
}

// Run scheduling for all depots
// Each depot gets its own knapsack solution
function scheduleAllDepots(depots, vehicles) {
  Log("backend", "info", "handler", `Scheduling ${depots.length} depots`);

  const results = depots.map((depot) => {
    const { selectedTasks, totalImpact, totalDuration } = solveKnapsack(
      depot.MechanicHours,
      vehicles
    );

    Log(
      "backend",
      "info",
      "handler",
      `Depot ${depot.ID}: impact=${totalImpact} hrs=${totalDuration}`
    );

    return {
      depotId: depot.ID,
      availableHours: depot.MechanicHours,
      usedHours: totalDuration,
      totalImpact: totalImpact,
      tasksScheduled: selectedTasks.length,
      selectedTasks: selectedTasks.map((t) => ({
        taskId: t.TaskID,
        duration: t.Duration,
        impact: t.Impact,
      })),
    };
  });

  return results;
}

module.exports = { solveKnapsack, scheduleAllDepots };
