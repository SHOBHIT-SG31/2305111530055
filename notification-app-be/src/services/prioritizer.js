// Service to prioritize and sort notifications based on weight and recency.
// Weight priority: Placement > Result > Event.
// Recency priority: Newer timestamps first.
const { Log } = require("logging-middleware");

const WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// Compare two notifications: returns negative if A has higher priority than B
function compareNotifications(a, b) {
  const weightA = WEIGHTS[a.Type] || 0;
  const weightB = WEIGHTS[b.Type] || 0;

  if (weightA !== weightB) {
    return weightB - weightA; // Higher weight first
  }

  // If weights are equal, compare timestamps (newer first)
  const timeA = new Date(a.Timestamp.replace(" ", "T")).getTime();
  const timeB = new Date(b.Timestamp.replace(" ", "T")).getTime();
  return timeB - timeA;
}

// 1. Batch approach: Sorts the entire array (good for full fetches)
// Time Complexity: O(N log N)
function getTopNotifications(notifications, limit = 10) {
  Log("backend", "info", "handler", `Prioritizing ${notifications.length} notifications`);
  const sorted = [...notifications].sort(compareNotifications);
  return sorted.slice(0, limit);
}

// 2. Stream approach: Maintains the top K elements efficiently as new elements arrive
// Uses a Min-Heap logic to keep exactly K elements, offering O(log K) insertion instead of O(N log N)
class PriorityInbox {
  constructor(limit = 10) {
    this.limit = limit;
    this.heap = []; // Min-heap (root is the lowest priority item in the top K)
  }

  // Add a new notification to the stream
  add(notification) {
    if (this.heap.length < this.limit) {
      this.heap.push(notification);
      this._upHeap(this.heap.length - 1);
    } else if (compareNotifications(notification, this.heap[0]) < 0) {
      // If new notification has HIGHER priority than the lowest in our top K:
      this.heap[0] = notification;
      this._downHeap(0);
    }
  }

  // Get the sorted top K notifications (highest priority first)
  getTop() {
    return [...this.heap].sort(compareNotifications);
  }

  // Helper: bubble up
  _upHeap(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      // Min-heap condition: parent should have LOWER priority than child
      // (in our comparison, "higher priority" means compareNotifications returns negative)
      if (compareNotifications(this.heap[index], this.heap[parent]) > 0) {
        // Child has lower priority than parent (which is what we want for a min-heap)
        break;
      }
      this._swap(index, parent);
      index = parent;
    }
  }

  // Helper: trickle down
  _downHeap(index) {
    const len = this.heap.length;
    while (index * 2 + 1 < len) {
      let smallest = index * 2 + 1; // Left child
      const right = index * 2 + 2;

      if (right < len && compareNotifications(this.heap[right], this.heap[smallest]) > 0) {
        // Right child has lower priority than left child
        smallest = right;
      }

      if (compareNotifications(this.heap[smallest], this.heap[index]) >= 0) {
        // Child has equal or lower priority than parent, heap property is satisfied
        break;
      }

      this._swap(index, smallest);
      index = smallest;
    }
  }

  _swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

module.exports = {
  getTopNotifications,
  compareNotifications,
  PriorityInbox,
};
