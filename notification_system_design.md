# Notification System Design

## 1. Asynchronous Mass Notification Queue
To handle sending notifications to 50,000 students efficiently without blocking the main event loop, we employ an asynchronous batch-processing approach.

### Architecture
- **API Entry Point (`POST /api/notifications/mass`)**: Accepts the payload and immediately returns an `HTTP 202 Accepted` response. This ensures the client connection is not kept alive unnecessarily.
- **Background Queue Execution**: We use `setImmediate()` or a dedicated background job runner (e.g., BullMQ with Redis in production) to decouple the execution from the request-response cycle.
- **Batch Processing**: Instead of dispatching 50,000 asynchronous tasks simultaneously (which could exhaust the thread pool or memory), the queue processes users in fixed batches (e.g., 1,000 at a time).
- **Yielding Event Loop**: Between batches, an artificial delay (or asynchronous `setTimeout`) ensures the Node.js event loop has breathing room to handle other incoming API requests or garbage collection.

### 2. Stage 3 Query Optimization
- We fetch unread notifications for a student via `SELECT * FROM notifications WHERE studentId = X AND isRead = false ORDER BY createdAt DESC`.
- **Compound Indexing**: To optimize this, the MongoDB schema features a compound index on `{ studentId: 1, isRead: 1, createdAt: -1 }`. This prevents full collection scans and ensures queries on millions of records run in single-digit milliseconds.
- **Pagination**: Implemented using `.skip()` and `.limit()` to ensure manageable memory payloads over the wire.
