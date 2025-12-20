# Collaborative Task Manager

Full-stack task management application with real-time collaboration.

Tech stack:
- Frontend: Next.js, TypeScript, Tailwind, React Query
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Real-time: Socket.io

## 🚀 Live Deployment

Frontend: https://collaborative-task-manager-one-pied.vercel.app/
Backend API: https://taskflow-backend-w8ce.onrender.com


## 🛠️ Setup Instructions (Local)

### Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL

---

### Backend

```bash
cd backend
npm install
```

#### Create Environment File

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

#### Run Migrations and Start Server

```bash
npx prisma migrate dev
npm run dev
```

Backend runs at http://localhost:4000.

### Frontend

```bash
cd frontend
npm install
```

#### Create Environment File

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Start Development Server

```bash
npm run dev
```

Frontend runs at http://localhost:3000.

<!-- API Endpoints -->

## 📡 API Contract

All backend APIs are exposed under a REST interface. Authentication uses JWTs stored in HttpOnly cookies and is enforced via middleware on protected routes.

Unless stated otherwise, all protected endpoints require an authenticated session. All endpoints are versioned under /api.

---

### 🔐 Authentication APIs

| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user and set JWT cookie |
| POST | `/api/auth/logout` | Clear authentication session |

**Notes:**
- Passwords are hashed using `bcrypt`
- JWTs are stored in HttpOnly cookies to reduce XSS exposure
- Authentication middleware is intentionally not applied to these routes

---

### 👤 User & Profile APIs

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/api/me` | Get the currently authenticated user |
| PATCH | `/api/me` | Update authenticated user’s profile |
| GET | `/api/users` | List all registered users |

---

### 📋 Task Management APIs

| Method | Endpoint | Description |
|------|--------|------------|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | List tasks (supports filtering & sorting) |
| GET | `/api/tasks/:id` | Get task by ID |
| PATCH | `/api/tasks/:id` | Update task fields (partial update) |
| DELETE | `/api/tasks/:id` | Delete a task |

**Task Attributes**
- `title`
- `description`
- `dueDate`
- `priority`
- `status`
- `creatorId`
- `assignedToId`

**Notes:**
- `PATCH` is used instead of `PUT` to support partial updates
- Input validation is enforced using Zod DTOs
- All routes are protected by authentication middleware

---

### 🔔 Notification APIs

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/api/notifications` | List user notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |

**Notes:**
- Notifications are created as a side-effect of task assignment
- Notification state is persistent and updated in real time

---

### ❤️ Health Check

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/health` | Service health check |

---

## 🏗️ Architecture Overview & Design Decisions

The application prioritizes separation of concerns, data integrity, and predictable behavior under concurrent usage.
---

### Backend Architecture

The backend follows a **Controller → Service → Repository** pattern:

- **Controllers:** Handle HTTP request/response lifecycle, perform no business logic, delegate to services
- **Services:** Contain core business logic, enforce rules (task ownership, assignment behavior, side-effects), coordinate between repositories and external concerns (notifications, sockets)
- **Repositories:** Isolate all database access, use Prisma as the single source of truth for persistence, keep services database-agnostic

This separation improves testability and prevents tight coupling between HTTP and business logic.

---

### Database Choice: PostgreSQL

PostgreSQL was chosen for:
- Strong relational integrity for user-task relationships
- Reliable transactional behavior
- Mature ecosystem and Prisma support
- Suitability for structured, relational task data

The schema enforces foreign key relationships between users, tasks, and notifications to prevent inconsistent state.

---

### ORM: Prisma

Prisma provides:
- Type-safe database access
- Strongly typed models aligned with the database schema
- Simplified migrations and schema evolution

All database interactions are routed through repository classes to avoid leaking Prisma logic into services or controllers.

---

### Authentication & Session Handling

Authentication uses **JWTs stored in HttpOnly cookies**:
- HttpOnly cookies reduce XSS attack surface compared to localStorage
- JWTs enable stateless authentication across REST and Socket.io
- Authentication middleware protects all sensitive routes
- The same authenticated session is reused for REST APIs and real-time socket connections

---

### Validation Strategy

All incoming request payloads are validated using **Zod DTOs**:
- Validation occurs at the API boundary
- Invalid requests are rejected before reaching business logic
- DTOs act as a contract between the client and server

This ensures consistent error handling and predictable API behavior.

---

### Frontend Architecture & Data Management

The frontend uses **React Query** for server-state management:
- Centralized data fetching and caching
- Automatic background refetching
- Clear distinction between server state and UI state

Forms use React Hook Form with Zod validation to mirror backend constraints and reduce invalid submissions.

---

### Real-Time Communication Design

Socket.io is integrated for real-time event propagation only; all data mutations occur through REST APIs. Socket events are emitted as side-effects after successful API operations, ensuring REST APIs remain the single source of truth and preventing race conditions.

---

### Error Handling

Centralized error-handling middleware:
- Returns consistent HTTP status codes
- Provides meaningful error messages
- Prevents unhandled exceptions from crashing the server

---

<!-- Testing Overview Section -->
## 🧪 Testing Overview

Unit tests are implemented using Jest at the service layer, focusing on critical business logic rather than HTTP wiring.

Tested areas:
- Task creation validation (ownership, assignee handling)
- Side-effect behavior such as notification creation
- Error handling for invalid task operations

The service layer was chosen because it represents the core business rules independent of transport (REST or sockets). Tests are located in the service layer test directory and can be run using npm test.


## ⚖️ Trade-offs & Assumptions

Trade-offs and assumptions prioritize correctness, clarity, and maintainability within the scope of the assignment.

---

### Real-Time Design Trade-offs

- Socket.io is used only for event propagation, not for direct data mutation
- All writes go through REST APIs, which slightly increases latency compared to socket-only flows
- This approach avoids race conditions and inconsistent state

---

### Authentication Assumptions

- Authentication is session-based using JWTs stored in HttpOnly cookies
- Token rotation and refresh flows are not implemented; session duration is assumed to be short-lived
- Role-based access control is not included beyond basic ownership and assignment checks

---

### Data & Feature Scope

- Tasks are assumed to have a single assignee at any given time
- Soft deletes, task history, and advanced audit trails are intentionally excluded
- Optimistic UI updates were not implemented to avoid masking backend errors

---

### Testing Scope

- Unit tests focus on critical service-layer business logic
- Full end-to-end testing and load testing are out of scope
- Socket behavior is validated indirectly through service tests and manual verification

---

### Deployment Assumptions

- The application is deployed as a single-instance backend
- Horizontal scaling and message brokers are not required for the expected usage scale
- Environment-specific configurations are managed via environment variables

---