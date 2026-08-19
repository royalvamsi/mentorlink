# MentorLink — Project Requirements

## 1. Product Overview

MentorLink is a real-time college mentorship platform connecting:

- **Junior students** — seeking guidance, resources, and career advice
- **Senior students** — sharing experience and mentoring juniors
- **Alumni** — providing industry insights and long-term mentorship

The goal is to help students find mentors, communicate in real time, schedule sessions, share resources, track goals, and participate in a student community.

---

## 2. User Roles

| Role     | Description                                |
|----------|--------------------------------------------|
| `JUNIOR` | Undergraduate student seeking mentorship   |
| `SENIOR` | Upperclassman offering mentorship          |
| `ALUMNI` | Graduate offering professional mentorship  |
| `ADMIN`  | Platform administrator and moderator       |

---

## 3. Core Features

| # | Feature                    | Priority |
|---|----------------------------|----------|
| 1 | Role-based authentication  | MVP      |
| 2 | User profiles              | MVP      |
| 3 | Mentor discovery & matching| MVP      |
| 4 | Mentorship requests        | MVP      |
| 5 | Real-time chat             | MVP      |
| 6 | Scheduling & availability  | MVP      |
| 7 | Feedback & ratings         | MVP      |
| 8 | Secure file sharing        | MVP      |
| 9 | Community discussion forums| MVP      |
| 10| Goal tracking              | MVP      |
| 11| Notifications & reminders  | MVP      |
| 12| Admin / moderation tools   | MVP      |
| 13| Fully responsive UI        | MVP      |

> **Mentor matching** — initial MVP uses search and filtering. Algorithmic matching is planned for a future phase.

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP client**: Axios

### Backend
- **Runtime**: Node.js >= 18
- **Framework**: Express.js
- **Language**: TypeScript

### Database
- **Database**: MongoDB Atlas
- **ODM**: Mongoose

### Authentication
- JWT (access tokens)
- bcrypt (password hashing)

### Real-time
- Socket.io

### File Storage
- Firebase Storage or AWS S3 (TBD)

### Deployment
- **Frontend**: Vercel
- **Backend**: Render or Railway
- **Database**: MongoDB Atlas

---

## 5. Non-Functional Requirements

- All secrets managed via environment variables; never committed.
- Passwords hashed with bcrypt (cost factor ≥ 12).
- JWT tokens signed with a strong secret; short expiry with refresh.
- Input validation on all API endpoints.
- Consistent JSON error responses with appropriate HTTP status codes.
- Role-based authorization on protected routes.
- File upload type and size restrictions enforced.
- MongoDB queries protected against injection.
- CORS configured for allowed origins only.
- Rate limiting on auth endpoints.
- No sensitive data exposed in API responses or server logs.
