## Vehicle Scheduler Backend

A microservice that optimizes daily vehicle maintenance scheduling across depots. Uses a 0/1 Knapsack algorithm to maximize operational impact within each depot's available mechanic-hours.

### How it works

1. Fetches depot data (ID, MechanicHours) from the evaluation server
2. Fetches vehicle tasks (TaskID, Duration, Impact) from the evaluation server
3. For each depot, runs a DP-based knapsack to pick the best set of tasks
4. Returns the optimized schedule

### Setup

```bash
cd vehicle-scheduler-be
npm install
npm start
```

Server runs on `http://localhost:3001`

### API Endpoints

**GET /schedule**
Returns the optimized maintenance schedule for all depots.

**GET /health**
Health check endpoint.

### Algorithm

Uses dynamic programming (0/1 Knapsack) — O(n × W) time complexity where n = number of tasks and W = depot capacity. No external algorithm libraries used.
