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

### Screen Shots

<img width="622" height="882" alt="image" src="https://github.com/user-attachments/assets/279e3f41-f6d3-47c3-9024-03e8f0cefebd" />
<img width="807" height="886" alt="image" src="https://github.com/user-attachments/assets/19c2a42a-599f-4e60-a793-407df1b21dee" />
<img width="1003" height="882" alt="image" src="https://github.com/user-attachments/assets/7df9cdc8-31b2-43bd-9b5d-c537dc1b44d3" />
<img width="646" height="872" alt="image" src="https://github.com/user-attachments/assets/28a6178c-574a-4c8e-b98d-e76d7830b197" />


