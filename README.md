# Backend Track Solution

This repository contains the solution for the backend track assessment. The project is organized into modular services and includes a custom logging middleware as required.

## Project Structure

- `logging_middleware/`: A reusable logging package that handles authentication and pushes logs to the centralized test server.
- `vehicle_maintence_scheduler/`: Microservice for optimizing vehicle maintenance tasks using a 0/1 Knapsack algorithm.
- `notification_app_be/`: Microservice for managing student notifications, including priority sorting and mass notification simulation.
- `notification_system_design.md`: Technical documentation for the notification system architecture and query optimization.

## Features

1. **Vehicle Scheduler**: Implementation of a Dynamic Programming based 0/1 Knapsack solver to maximize task impact within mechanic hour constraints.
2. **Notification Priority**: Custom sorting logic to prioritize 'Placement' > 'Result' > 'Event' types, with secondary sorting by timestamp.
3. **Optimized Queries**: Compound indexing on `studentId`, `isRead`, and `createdAt` for high-performance notification retrieval.
4. **Mass Notification**: Asynchronous batch-processing queue system to handle large-scale notification dispatch (50,000+ users) without blocking.
5. **Centralized Logging**: Middleware that ensures all significant application lifecycle events are recorded with proper context.

