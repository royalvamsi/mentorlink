# MentorLink — Architecture

> Updated as the project is built. This document reflects the current state of the codebase.

---

## 1. High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│         React + TypeScript + Vite + Tailwind CSS        │
│                   (Vercel / localhost)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────┐
│                       SERVER                            │
│          Node.js + Express + TypeScript                 │
│                   (Render / Railway)                    │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐  ┌─────────────┐  │
│  │   REST API   │   │  Socket.io   │  │  File svc   │  │
│  │  /api/*      │   │  (Phase 5)   │  │  (Phase 8)  │  │
│  └──────────────┘   └──────────────┘  └─────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose
┌──────────────────────▼──────────────────────────────────┐
│                   MongoDB Atlas                         │
│                  (managed cloud DB)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

### Frontend (`frontend/`)

```
frontend/
├── public/
└── src/
    ├── assets/          # Static images, icons, fonts
    ├── components/      # Shared, reusable UI components
    ├── context/         # React Context providers
    ├── hooks/           # Custom React hooks
    ├── layouts/         # Page layout wrappers
    ├── pages/           # Route-level page components
    ├── services/        # Axios API call modules
    ├── types/           # Shared TypeScript type definitions
    ├── utils/           # Pure utility functions
    ├── App.tsx          # Root component, routing
    ├── main.tsx         # React entry point
    └── index.css        # Tailwind base + global styles
```

### Backend (`backend/`)

```
backend/
└── src/
    ├── config/          # Environment loading, DB connection
    ├── controllers/     # Request handlers (thin, delegates to service)
    ├── middleware/       # Auth, error handler, rate limiter, validation
    ├── models/          # Mongoose schema + model definitions
    ├── routes/          # Express routers
    ├── services/        # Business logic
    ├── types/           # Shared TypeScript types and interfaces
    ├── utils/           # Utility functions (logger, response helpers)
    ├── app.ts           # Express app setup
    └── server.ts        # Server entry point
```

---

## 3. API Namespace

| Prefix              | Description                    | Status      |
|---------------------|--------------------------------|-------------|
| `/api/health`       | Health check                   | ✅ Phase 1  |
| `/api/auth`         | Registration, login, logout    | Phase 2     |
| `/api/users`        | User account management        | Phase 2     |
| `/api/profiles`     | Profile CRUD                   | Phase 3     |
| `/api/mentors`      | Mentor search and discovery    | Phase 4     |
| `/api/mentorships`  | Mentorship relationships       | Phase 4     |
| `/api/conversations`| Chat conversations             | Phase 5     |
| `/api/messages`     | Chat messages                  | Phase 5     |
| `/api/availability` | Mentor availability slots      | Phase 6     |
| `/api/bookings`     | Session bookings               | Phase 6     |
| `/api/feedback`     | Ratings and feedback           | Phase 7     |
| `/api/files`        | File upload and download       | Phase 8     |
| `/api/forums`       | Community topics               | Phase 9     |
| `/api/goals`        | Goal tracking                  | Phase 10    |
| `/api/notifications`| Notifications                  | Phase 11    |
| `/api/admin`        | Admin moderation               | Phase 12    |

---

## 4. Authentication Flow (Phase 2 — planned)

```
Client                         Server
  │── POST /api/auth/register ──▶ │  Validate → hash password → save User
  │◀── { token, user } ──────────│
  │                               │
  │── POST /api/auth/login ──────▶│  Verify credentials → sign JWT
  │◀── { token, user } ──────────│
  │                               │
  │── GET /api/protected ────────▶│  verifyToken middleware → authorize
  │◀── { data } ─────────────────│
```

---

## 5. Real-time Architecture (Phase 5 — planned)

Socket.io will be mounted on the same HTTP server as Express.

Events planned:

| Event             | Direction       | Description              |
|-------------------|-----------------|--------------------------|
| `join_room`       | Client → Server | Join a conversation room |
| `send_message`    | Client → Server | Send a chat message      |
| `receive_message` | Server → Client | Deliver a message        |
| `typing`          | Client → Server | Typing indicator         |
| `stop_typing`     | Client → Server | Stop typing indicator    |
| `user_online`     | Server → Client | User came online         |
| `user_offline`    | Server → Client | User went offline        |

---

## 6. Database Models (planned)

> Models are created when the corresponding feature is implemented.

| Model               | Phase |
|---------------------|-------|
| `User`              | 2     |
| `Profile`           | 3     |
| `Mentorship`        | 4     |
| `MentorshipRequest` | 4     |
| `Conversation`      | 5     |
| `Message`           | 5     |
| `Availability`      | 6     |
| `Booking`           | 6     |
| `Feedback`          | 7     |
| `File`              | 8     |
| `Forum`             | 9     |
| `Post`              | 9     |
| `Comment`           | 9     |
| `Goal`              | 10    |
| `Milestone`         | 10    |
| `Notification`      | 11    |
| `Report`            | 12    |
