# StudySync — Realtime Collaboration Platform

> A full-stack realtime collaboration web app combining **voice chat**, an **infinite shared whiteboard**, and **instant friction-free rooms**. Built for study groups, remote teams, and interactive client sessions.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

---

## 🌟 Key Features

- **Multiplayer Infinite Whiteboard**: Shared canvas with pen, highlighter, shapes, text, eraser, and independent undo/redo stacks.
- **Realtime Voice Chat**: Integrated WebRTC voice room with participant audio level indicators.
- **Zero-Friction Guest Joins**: Classmates and collaborators can join via shareable link instantly with just a display name (no account creation required).
- **Supabase Hybrid Architecture**: Supabase manages Auth, Storage, and hosted PostgreSQL, while Prisma provides a type-safe unified data access layer.
- **Server-Authoritative Room State**: Room presence, host handoff, grace periods, and board locking are enforced on the backend.
- **Fork Your Own Board**: Fork any active room canvas into a private workspace without disrupting the shared board.

---

## 🏗️ Tech Stack & Architecture

### **Frontend (`/client`)**
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (custom muted neutral palette, hairline 0.5px borders)
- **Icons**: Lucide React
- **Auth Client**: `@supabase/supabase-js` for signup, login, and session persistence

### **Backend (`/server`)**
- **Runtime**: Node.js + TypeScript (`tsx` for dev, `tsc` for production)
- **API Framework**: Express.js REST API
- **Realtime Layer**: `ws` WebSocket server for low-latency presence, messaging, and synchronization
- **Database & ORM**: Supabase-hosted PostgreSQL queried via Prisma ORM
- **Auth Verification**: Server-side token verification using Supabase Admin SDK

---

## 📂 Repository Structure

```
studyboard/
├── client/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Supabase Auth modal
│   │   │   ├── room/           # Create Room, Join Room, Live Room View
│   │   │   ├── whiteboard/     # Canvas and drawing tools
│   │   │   ├── participants/   # Participant rail (expanded, collapsed, hidden)
│   │   │   └── voice/          # WebRTC voice indicators
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Supabase client, API client, AuthProvider
│   │   ├── pages/              # App routing and view pages
│   │   ├── App.tsx             # Main dashboard and studio router
│   │   └── main.tsx            # Entrypoint
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Node.js + Express + WebSocket Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema (profiles, rooms, participants, etc.)
│   │   └── triggers.sql        # Postgres trigger syncing auth.users -> public.profiles
│   ├── src/
│   │   ├── middleware/         # requireAuth & optionalAuth token verification
│   │   ├── routes/             # REST endpoints (/api/health, /api/rooms)
│   │   ├── services/           # Prisma client, Supabase admin service
│   │   ├── ws/                 # Realtime WebSocket server handlers
│   │   └── index.ts            # Server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── docs/                       # Project specifications & build prompts
│   ├── PRODUCT.md
│   ├── STRUCTURE.md
│   ├── DATA_MODEL.md
│   ├── API_CONTRACT.md
│   ├── DESIGN.md
│   └── BUILD_PROMPTS.md
├── package.json                # Monorepo workspaces configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Supabase Account**: A Supabase project for Auth, Storage, and PostgreSQL

### 2. Clone & Install Dependencies

```bash
git clone https://github.com/Sagar-Sonewane/studyboard.git
cd studyboard
npm install
```

### 3. Configure Environment Variables

Create `.env` at the root (or configure `client/.env` and `server/.env`):

```bash
# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Postgres Connection String (used by Prisma)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# Client Vite Configuration
VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_API_URL="http://localhost:4000"
VITE_WS_URL="ws://localhost:4000"

# Server Configuration
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### 4. Setup Database & Prisma

Generate the Prisma client:
```bash
npm run prisma:generate
```

Execute the SQL trigger in `server/prisma/triggers.sql` inside your Supabase SQL Editor to automatically mirror newly registered users to `public.profiles`.

### 5. Run Development Servers

Start both the backend server and frontend client concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **WebSocket Endpoint**: `ws://localhost:4000/ws`

---

## 📡 REST API & WebSocket Contract

### REST Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health, DB connectivity, uptime | No |
| `POST` | `/api/rooms` | Create a new room with shareable invite code | Yes (`Bearer <token>`) |
| `GET` | `/api/rooms/:inviteCode` | Resolve invite code to room metadata | No |
| `POST` | `/api/rooms/:id/join` | Join session as authenticated user or guest | Optional |

### WebSocket Events
- `connection:established`: Diagnostic server welcome
- `ping` / `pong`: Low-latency round-trip health check
- `presence:join` / `presence:leave`: Realtime room presence broadcast
- `room:grace_period_started` / `room:resumed`: Server-authoritative lock management

---

## 🛠️ Build Scripts

```bash
# Run both frontend and backend concurrently
npm run dev

# Run backend only
npm run dev:server

# Run frontend only
npm run dev:client

# Typecheck and build production bundles for both workspaces
npm run build

# Generate Prisma Client
npm run prisma:generate
```

---

## 📄 License

MIT © [Sagar Sonewane](https://github.com/Sagar-Sonewane)
