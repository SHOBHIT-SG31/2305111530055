# Notification System Design (Short Summary)

This document outlines the concise design decisions and solutions across the project evaluation stages.

---

## Stage 1: API Design & Real-Time Push

### 1. REST API Contract
*   **Fetch Notifications:** `GET /api/v1/notifications` (Bearer JWT, paginated, optional filter by type/unread status).
*   **Mark Read:** `PATCH /api/v1/notifications/read` (Body: `{"notificationIds": [...]}`).
*   **Create Broadcast:** `POST /api/v1/notifications` (Admin only, Body: `{"type": "Placement", "message": "..."}`).

### 2. Real-Time Push Mechanism
*   **WebSockets (Socket.io):** Standard client handshake using the JWT token to map `student_id -> socket_id`.
*   **Scaling:** Uses a **Redis Pub/Sub adapter** to broadcast event notifications across multiple server nodes.

---

## Stage 2: Database Schema & Scaling

### 1. Database Choice: PostgreSQL
Relational database offers ACID transactional consistency for delivery records and supports strong composite indexing.

### 2. Schema Setup
```sql
CREATE TYPE notification_type AS ENUM ('Placement', 'Event', 'Result');

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_notifications (
    id BIGSERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_unread ON student_notifications (student_id, is_read, created_at DESC);
```

### 3. Scaling Plan (5M+ rows)
*   **Partitioning:** Table partition `student_notifications` by range on `created_at`.
*   **Read-Replicas:** Offload lookup queries from primary DB to read-replicas.
*   **Archival:** Move notifications older than 6 months to backup cold storage.

---

## Stage 3: Slow Query Diagnostics & Indexing

### 1. Diagnostics for slow query
`SELECT * FROM notifications WHERE studentID = 1042 AND isRead = false ORDER BY createdAt DESC;`
*   **Accuracy:** Accurate only if notifications are cloned for every student.
*   **Why slow:** Full sequential table scan (O(N)) and in-memory filesort due to missing index.
*   **Fix:** Add index: `CREATE INDEX idx_lookup ON notifications(studentID, isRead, createdAt DESC);` (reduces lookup to O(log N)).

### 2. Over-indexing critique
Indexing every column is bad because:
*   Slows down all writes (every insert/update must update indexes).
*   Consumes massive RAM and disk space, flushing hot data out of cache.

### 3. Last 7 Days Placement Query
```sql
SELECT n.id, n.message, n.created_at
FROM notifications n
WHERE n.type = 'Placement' AND n.created_at >= NOW() - INTERVAL '7 days'
ORDER BY n.created_at DESC;
```

---

## Stage 4: Database Load Mitigation
1.  **Redis Cache (Recommended):** Store user unread notification arrays or counts in memory. Fast, but requires active cache invalidation.
2.  **HTTP ETag:** Return 304 status code if list is unchanged. Saves bandwidth but still queries DB to compute ETag.
3.  **Client-Side Sync:** Fetch list once on login and append new notifications locally via WebSocket connection.

---

## Stage 5: Concurrent Broadcast Redesign

### 1. Shortcomings of Synchronous Loop
*   Blocking requests (50k students sequentially would take over 80 minutes and timeout).
*   No fault tolerance (an email failure halfway aborts the remaining bulk).
*   Overwhelms database connection pool and violates SMTP provider rate limits.

### 2. Message Queue Redesign (BullMQ/Redis)
*   Expose immediate coordinator endpoint returning `202 Accepted`.
*   Background workers split job into parallel batch tasks of size 1000.

### 3. Pseudocode
```javascript
// POST /api/v1/notifications/broadcast
async function notifyAllHandler(req, res) {
  const broadcastId = await saveBroadcastMetadata(req.body.message);
  await broadcastQueue.add("process_broadcast", { broadcastId, message: req.body.message });
  return res.status(202).json({ success: true, broadcastId });
}

// Coordinator Worker
async function processBroadcastJob(job) {
  const studentIds = await getAllStudentIds();
  const chunk = 1000;
  for (let i = 0; i < studentIds.length; i += chunk) {
    const batch = studentIds.slice(i, i + chunk);
    await emailQueue.addBulk(batch.map(id => ({ name: "send_email", data: { id, message: job.data.message } })));
    await pushQueue.addBulk(batch.map(id => ({ name: "push_app", data: { id, message: job.data.message } })));
    await dbQueue.addBulk(batch.map(id => ({ name: "save_db", data: { id, broadcastId: job.data.broadcastId } })));
  }
}
```

---

## Stage 6: Priority Inbox Implementation

### 1. Algorithmic Approach
*   **Prioritization:** Sorts by `Placement` (Weight 3) > `Result` (Weight 2) > `Event` (Weight 1), then chronologically by newest timestamp.
*   **Streaming Efficiency:** Bounded `Min-Heap` (size K=10) logic runs in **O(log K)** time per new stream insertion instead of O(N log N) complete sorting.

### 2. Verification Dashboard Output (GET `/priority`)
```
Rank | Type (Weight) | Message                                                      | Timestamp
------------------------------------------------------------------------------------------------------------------
 1   | Placement [3] | Marvell Technology Inc. hiring                               | 2026-06-26 04:31:37
 2   | Placement [3] | Tesla Inc. hiring                                            | 2026-06-25 21:31:10
 3   | Placement [3] | Alphabet Inc. Class A hiring                                 | 2026-06-25 20:02:31
 4   | Placement [3] | PayPal Holdings Inc. hiring                                  | 2026-06-25 19:03:07
 5   | Placement [3] | Booking Holdings Inc. hiring                                 | 2026-06-25 12:02:40
 6   | Placement [3] | Amazon.com Inc. hiring                                       | 2026-06-25 07:33:25
 7   | Placement [3] | Visa Inc. hiring                                             | 2026-06-25 07:03:43
 8   | Result [2]    | external                                                     | 2026-06-26 06:32:13
 9   | Result [2]    | external                                                     | 2026-06-26 06:31:28
10   | Result [2]    | external                                                     | 2026-06-26 02:31:01
```
