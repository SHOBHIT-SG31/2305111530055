## Notification App Backend

A microservice that aggregates, parses, and prioritizes campus-wide student notifications. It connects to the evaluation server to fetch raw notifications and returns the top 10 most relevant ones based on type weight and recency.

### Prioritization Logic
The priority inbox filters and displays notifications using the following rules:
1.  **Weight:** `Placement` (Weight 3) > `Result` (Weight 2) > `Event` (Weight 1).
2.  **Recency:** If types have the same weight, they are sorted chronologically with the newest notifications first.

---

### How to Run

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the server:**
    ```bash
    npm start
    ```
    This will start the Express application on **port 3002**.

3.  **Run the local test client:**
    ```bash
    npm test
    ```
    This executes `test-priority.js`, which hits the local priority inbox endpoint and displays a formatted dashboard of the prioritized feed.

---

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Verification check to ensure service is alive |
| GET | `/priority` | Fetches, prioritizes, and outputs the top 10 notifications |
