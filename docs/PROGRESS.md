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

---

## 🔄 Current Feature

None in progress.

---

## 📋 Next Features

### Phase 2 — Authentication
- [ ] `User` Mongoose model with role enum (`JUNIOR`, `SENIOR`, `ALUMNI`)
- [ ] `POST /api/auth/register` — validate input, hash password, issue JWT
- [ ] `POST /api/auth/login` — verify credentials, issue JWT
- [ ] `POST /api/auth/logout` — invalidate token (client-side or server-side blocklist)
- [ ] `verifyToken` middleware — decode and attach user to `req`
- [ ] `authorizeRoles` middleware — role-based access control
- [ ] Frontend: Register and Login pages
- [ ] Frontend: Auth context + persistent login (`localStorage` / HTTP-only cookie TBD)
- [ ] Frontend: Protected route wrapper
- [ ] Frontend: Logout flow

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
