# MentorLink

A real-time college mentorship platform connecting junior students, senior students, and alumni.

## Repository Structure

```
MentorLink/
├── frontend/   # React + TypeScript + Vite + Tailwind CSS
├── backend/    # Node.js + Express + TypeScript
├── docs/       # Project documentation
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (or local MongoDB)

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Runs at `http://localhost:5173`

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

Runs at `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

## Documentation

- [Project Requirements](docs/PROJECT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Progress](docs/PROGRESS.md)
