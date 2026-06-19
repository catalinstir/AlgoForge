# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

AlgoForge (branded "AlgoRush") is a MERN-stack coding challenge platform built for a university **Human-Computer Interaction (HCI) course**. Keep solutions simple — security hardening, scalability, and production robustness are not goals.

## Commands

**Backend** (`/backend`):
```bash
npm run dev      # start with nodemon (watch mode)
npm start        # start with node
npm run seed     # seed the database
```

**Frontend** (`/frontend`):
```bash
npm run dev      # Vite dev server (default: http://localhost:5173)
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
```

**Docker** (from repo root):
```bash
cp .env.example .env
docker compose up --build
```

## Architecture

- **Backend**: Express 5 + Mongoose on port 5000. Entry point is `backend/index.js`. Routes are in `backend/routes/`, business logic in `backend/controllers/`, DB schemas in `backend/models/`.
- **Frontend**: React 19 + TypeScript + Vite + React Router v7 + Bootstrap 5. Entry point is `frontend/src/main.tsx`.
- **Database**: MongoDB — connection URI defaults to `mongodb://localhost:27017/algorush`, overridden via `MONGO_URI` env var.
- **Code execution**: Uses Docker containers (`node:16-alpine`, `python:3.9-alpine`, `gcc:11.2`) to run submitted code. Setup script at `backend/docker/docker-setup.sh`.

## Key env vars

| Variable | Used by | Purpose |
|---|---|---|
| `MONGO_URI` | backend | MongoDB connection string |
| `FRONTEND_URL` | backend | CORS allowed origin |
| `VITE_API_URL` | frontend (build-time) | Backend API base URL |
