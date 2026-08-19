# MentorLink — Progress

## ✅ Completed

### Phase 1 — Foundation
- Monorepo folder structure created
- Root `.gitignore` and `README.md`
- Documentation: `PROJECT.md`, `ARCHITECTURE.md`, `PROGRESS.md`
- Frontend: Vite + React + TypeScript scaffold
- Frontend: Tailwind CSS installed and configured
- Frontend: Placeholder landing page
- Backend: Express + TypeScript setup
- Backend: `GET /api/health` endpoint
- Backend: MongoDB connection module (Mongoose)
- Backend: Typed environment variable loader
- Backend: `.env.example` for both frontend and backend

### Phase 2 — Authentication & Authorization
- `User` Mongoose model with bcrypt password hashing and roles (`JUNIOR`, `SENIOR`, `ALUMNI`)
- Auth service: `registerUser`, `loginUser`, `getMeUser`
- Auth controller and routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Middleware: `verifyToken` and `authorizeRoles`
- Frontend: `AuthContext`, `ProtectedRoute`, `LoginPage`, `RegisterPage`, `DashboardPage`

### Phase 3 — User Profiles
- `Profile` Mongoose model with skills, academic/career interests, bio, year, links
- Profile service, controller, and routes (`/api/profile/me`, `/api/profile/:userId`)
- Frontend: `ProfilePage`, `EditProfilePage`, `profileService`

### Phase 4 — Mentor Discovery
- Discovery service with search, multi-skill filtering, department filtering, pagination
- Mentor controller and routes (`/api/mentors`, `/api/mentors/:id`)
- Frontend: `MentorDiscoveryPage`, `MentorProfilePage`, `MentorCard`, `mentorService`

### Phase 5 — Mentorship Requests & Connections
- `MentorshipRequest` and `Mentorship` Mongoose models
- Request lifecycle: send, cancel, accept, reject, list incoming/sent/active
- Mentorship controller and routes (`/api/mentorships/*`)
- Frontend: `MentorshipDashboardPage`, `SendRequestPage`, `mentorshipService`

### Phase 6 — Real-Time Chat
- `Conversation` and `Message` Mongoose models
- Chat service with 1-on-1 conversations, message history pagination, unread counters, mark-as-read
- Chat controller and routes (`/api/chat/conversations`, `/api/chat/conversations/:id/messages`, etc.)
- Socket.io integration with JWT authentication middleware on shared HTTP server
- Real-time events: `join_conversation`, `send_message`, `receive_message`, `typing`, `stop_typing`, `mark_read`, `messages_read`
- Online presence tracking supporting multiple tabs (`online_users`, `user_online`, `user_offline`)
- Frontend: `SocketContext` provider, `ChatPage` with conversation sidebar, message list, typing indicators, read receipts, auto-scroll, online indicators, and error/empty states

---

## 🔄 Current Feature

Phase 6 completed. Ready for Phase 7.


---

## ⚠️ Known Issues

None at this time.

---

## 🏛️ Important Technical Decisions

| Decision | Rationale |
|---|---|
| Monorepo (not separate repos) | Easier to manage in early stages; can split later if needed |
| Vite over CRA | Faster build, modern tooling, no ejection needed |
| Manual backend setup over NestJS/scaffold | Keeps the structure minimal and explicit for this team |
| JWT in HTTP-only cookie vs `localStorage` | **TBD in Phase 2** — leaning toward HTTP-only cookie for XSS protection |
| File storage: Firebase vs S3 | **TBD in Phase 8** — will evaluate cost and DX at that point |
