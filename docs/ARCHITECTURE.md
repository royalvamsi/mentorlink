# MentorLink — Architecture

> Complete technical architecture of MentorLink (Phases 1–17).

---

## 1. High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│         React 19 + TypeScript + Vite + Tailwind CSS     │
│                   (Vercel / localhost)                  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────┐
│                       SERVER                            │
│          Node.js + Express 5 + TypeScript               │
│               + Socket.io + Helmet                      │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐  ┌─────────────┐  │
│  │   REST API   │   │  Socket.io   │  │ File Storage│  │
│  │  /api/*      │   │  Real-time   │  │   Multer    │  │
│  └──────────────┘   └──────────────┘  └─────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ Mongoose 9
┌──────────────────────▼──────────────────────────────────┐
│                   MongoDB Atlas                         │
│                  (managed cloud DB)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. API Routes & Security Structure

| Route Prefix         | Description                                | Auth / Security Middleware |
|----------------------|--------------------------------------------|----------------------------|
| `/api/health`        | Health check                               | Public                     |
| `/api/auth`          | Register, login, me                        | Public / verifyToken, Rate Limited (20/15min) |
| `/api/profile`       | User profile CRUD                          | `verifyToken`              |
| `/api/mentors`       | Mentor search & details                    | `verifyToken`              |
| `/api/mentorships`   | Requests, accept/reject, active            | `verifyToken` + Participant Checks |
| `/api/chat`          | 1-on-1 conversations & messages            | `verifyToken` + Participant Checks |
| `/api/scheduling`    | Availability & session bookings            | `verifyToken` + `authorizeRoles` + Owner Checks |
| `/api/feedback`      | Ratings & reviews                          | `verifyToken` + Booking Participant Check |
| `/api/files`         | File sharing & downloads                   | `verifyToken` + File Access Verification |
| `/api/forum`         | Posts, comments, upvotes                   | `verifyToken` + Author / Admin Check |
| `/api/goals`         | Goal tracking & milestones                 | `verifyToken` + Owner / Mentorship Check |
| `/api/notifications` | In-app notifications                       | `verifyToken` + Scoped to User |
| `/api/admin`         | Moderation, user roles, stats              | `verifyToken` + `requireAdmin` |
| `/api/matching`      | Smart mentor recommendations               | `verifyToken`              |
| `/api/search`        | Global multi-entity search                 | `verifyToken` + Scoped Goal Search |

---

## 3. Security Hardening Layers

1. **HTTP Headers**: Helmet enabled with custom CSP and cross-origin embedder policy for real-time WebSocket compatibility.
2. **Rate Limiting**:
   - `authLimiter`: 20 requests per 15 minutes to prevent brute-force on `/api/auth`.
   - `apiLimiter`: 300 requests per 15 minutes for general API endpoints.
3. **Payload Protection**: Express JSON and URL-encoded body parsers capped at 2MB.
4. **ReDoS & Regex Injection Defense**: All user-controlled regex queries sanitized with `escapeRegex()` before query execution in MongoDB.
5. **Role-Based Access Control**:
   - `USER_ROLES`: `JUNIOR`, `SENIOR`, `ALUMNI`, `ADMIN`
   - Public registration strictly restricts role to `['JUNIOR', 'SENIOR', 'ALUMNI']` (privilege escalation prevention).
   - `requireAdmin` guard on all administrative routes.
   - `authorizeRoles` guard on availability slot creation (`SENIOR`, `ALUMNI`, `ADMIN`).
6. **Object-Level & Resource Ownership**:
   - File downloads restricted to uploader, mentorship participants, or conversation participants.
   - Bookings, goals, and conversations verified against requesting user's identity.
   - Forum post/comment deletion restricted to author or administrator.
7. **Socket.io Authentication**:
   - Handshake JWT verification required before connection.
   - Room joins and message sends verified against conversation membership.
   - Targeted private notification rooms (`user:<userId>`).
