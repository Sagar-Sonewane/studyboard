# StudySync — Realtime Voice & Whiteboard Collaboration

> **Say it. Sketch it. Together.**  
> A high-performance realtime collaboration platform combining low-latency voice chat, an infinite shared whiteboard with multi-page PDF markup, and friction-free guest rooms. Built for startups, remote teams, and study groups.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-6.3-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_Storage-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![LiveKit](https://img.shields.io/badge/LiveKit-WebRTC_Voice-002B49?style=flat-square&logo=webrtc&logoColor=white)](https://livekit.io/)
[![Yjs](https://img.shields.io/badge/Yjs-CRDT_Sync-blueviolet?style=flat-square)](https://github.com/yjs/yjs)

---

## 🌟 Key Features

- **Infinite Multiplayer Whiteboard**: Powered by `@tldraw/tldraw` engine paired with `Yjs` CRDT state synchronization over binary WebSockets (`/yjs`). Features freehand drawing, highlighters, geometric shapes, sticky notes, text, and independent undo/redo stacks.
- **Low-Latency Voice Rooms**: Integrated WebRTC voice chat powered by LiveKit Cloud with active speaker detection, mute controls, and a 3-state collapsible participant rail (*Expanded*, *Collapsed*, *Hidden*).
- **Multi-Page PDF & Image Annotation**: Upload images and multi-page PDFs directly to the canvas. PDFs are rasterized client-side via `pdf.js` into sequential image shapes. Highlighter and pen markings sit on an independent annotation layer that can be toggled or undone without altering the document.
- **Instant Guest Onboarding (`/room/:code`)**: Invite links bypass marketing pages completely, routing collaborators straight into the session with only a display name (no mandatory account creation or credit card).
- **Private Board Forking**: Any participant can fork the shared canvas into an isolated private workspace in one click to brainstorm independently before sharing findings with the group.
- **Collaboration Governance**: Host-controlled draw permissions, viewport synchronization ("follow host" with break-away and one-click return), and 10-color non-colliding cursor attribution.
- **Signature Marketing Experience (`/`)**: Built to a distinctive pop-art paper/ink aesthetic with Space Grotesk typography, hard offset shadows, tilted sticky notes, and perforated ticket-stub pricing cards.

---

## 🏗️ Architecture & Technology Stack

```
                          ┌───────────────────────────┐
                          │   Client (React 18 + TS)  │
                          │   Vite · Tailwind · tldraw│
                          └─────┬───────────────┬─────┘
                                │ HTTP/REST     │ WebSockets
             ┌──────────────────┼───────────────┼──────────────────┐
             ▼                  ▼               ▼                  ▼
    ┌────────────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────────────┐
    │ Supabase Auth  │  │ Express REST │  │ /ws       │  │ /yjs              │
    │  & Storage     │  │  Backend API │  │ Presence  │  │ Binary CRDT Sync  │
    └────────────────┘  └───────┬──────┘  └─────┬─────┘  └─────────┬─────────┘
                                │               │                  │
                                └───► Prisma ◄──┘                  │
                                         │                         │
                                         ▼                         ▼
                                ┌─────────────────┐       ┌─────────────────┐
                                │ Supabase PG DB  │       │ LiveKit WebRTC  │
                                └─────────────────┘       └─────────────────┘
```

| Layer | Technologies | Role |
|---|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, `@tldraw/tldraw`, Lucide Icons | Responsive UI, canvas rendering, LiveKit audio integration |
| **Realtime Sync** | Yjs, `y-websocket`, native WebSocket (`ws`) | Binary CRDT whiteboard synchronization, participant presence, and awareness |
| **Audio / Voice** | LiveKit Cloud Client SDK & Server SDK | Scalable WebRTC audio rooms, token generation, active speaker events |
| **Backend API** | Node.js, Express.js, TypeScript | Room lifecycle management, token verification, file upload limits (10MB) |
| **Database & ORM** | Supabase PostgreSQL, Prisma ORM | Relational schema (`profiles`, `rooms`, `boards`, `uploaded_files`, `entitlements`) |
| **Storage & Auth** | Supabase Storage (`room-files`), Supabase Auth | File hosting with service-role security and user authentication |

---

## 📂 Monorepo Structure

```
studyboard/
├── client/                     # Vite + React Frontend Application
│   ├── public/                 # Static assets (favicons, Open Graph images)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           # Supabase authentication modal
│   │   │   ├── participants/   # 3-state voice participant rail
│   │   │   ├── room/           # Room creation, direct join modal, room view
│   │   │   └── whiteboard/     # Whiteboard canvas, toolbar, palette flyout
│   │   ├── config/             # Plan limits, pricing, and landing config
│   │   ├── hooks/              # LiveKit voice, presence, and Yjs hooks
│   │   ├── lib/                # API client, PDF renderer, Supabase client
│   │   ├── pages/              # Landing page, dashboard, and 404 views
│   │   ├── App.tsx             # Main client router & modal orchestrator
│   │   └── index.css           # Design tokens, hard shadows, typography
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Node.js + Express Backend Server
│   ├── prisma/
│   │   ├── schema.prisma       # Data model schema
│   │   └── triggers.sql        # auth.users to public.profiles sync trigger
│   ├── src/
│   │   ├── middleware/         # Supabase JWT authentication middleware
│   │   ├── routes/             # REST endpoints (/api/health, /api/rooms)
│   │   ├── services/           # LiveKit token generator, Supabase storage
│   │   ├── ws/                 # Realtime presence and Yjs sync handlers
│   │   └── index.ts            # HTTP & WebSocket server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── docs/                       # Architectural specs and roadmap documentation
│   ├── PRODUCT.md              # Product specifications and tier definitions
│   ├── DESIGN.md               # Design system & landing page specifications
│   ├── STRUCTURE.md            # Technical architecture and hybrid model
│   ├── DATA_MODEL.md           # Database tables and relationship schemas
│   └── PROJECT_STATUS.md       # Incremental phase progress tracking
├── package.json                # Workspaces root configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or later (`v20+` recommended)
- **npm**: `v9.0.0` or later
- **Supabase Account**: A Supabase project with PostgreSQL, Auth, and Storage enabled.
- **LiveKit Cloud Account**: Free LiveKit Cloud project for WebRTC voice credentials.

### 2. Clone Repository & Install Dependencies

```bash
git clone https://github.com/Sagar-Sonewane/studyboard.git
cd studyboard
npm install
```

### 3. Environment Configuration

Create `.env` at the project root (or configure `client/.env` and `server/.env`):

```env
# ==========================================
# Backend & Database Configuration
# ==========================================
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"

# Supabase Credentials
SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Prisma PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require"

# LiveKit Voice Credentials
LIVEKIT_URL="wss://[YOUR-PROJECT].livekit.cloud"
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"

# ==========================================
# Client (Vite) Configuration
# ==========================================
VITE_SUPABASE_URL="https://[YOUR-PROJECT-ID].supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_API_URL="http://localhost:4000"
VITE_WS_URL="ws://localhost:4000"
```

### 4. Database Setup & Storage Bucket

1. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

2. **Sync Database Schema**:
   ```bash
   cd server
   npx prisma db push
   cd ..
   ```

3. **Supabase Auth Trigger**:
   Execute [`server/prisma/triggers.sql`](file:///d:/sagar/studyboard/server/prisma/triggers.sql) in your Supabase SQL Editor to automatically mirror newly registered `auth.users` to `public.profiles`.

4. **Storage Bucket**:
   Create a public bucket named `room-files` in your Supabase dashboard to allow whiteboard file uploads.

### 5. Run Development Servers

Run both the Vite frontend client and Express + WebSocket backend concurrently:

```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **Presence WebSocket**: `ws://localhost:4000/ws`
- **Yjs Whiteboard WebSocket**: `ws://localhost:4000/yjs`

---

## 📡 API & WebSocket Reference

### REST Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Service status, database latency & uptime | Public |
| `POST` | `/api/rooms` | Create a room and generate a 6-character code | Bearer Token |
| `GET` | `/api/rooms/:inviteCode` | Resolve invite code to room details | Public |
| `POST` | `/api/rooms/:id/join` | Join room (guest or authenticated user) | Optional |
| `POST` | `/api/rooms/:id/token` | Generate scoped LiveKit WebRTC audio token | Participant |
| `POST` | `/api/rooms/:id/files` | Upload and attach image/PDF (10MB limit) | Participant |
| `GET` | `/api/rooms/:id/files` | Retrieve files attached to the room | Participant |
| `POST` | `/api/rooms/:id/boards/fork` | Clone shared whiteboard into a private board | Participant |

### Realtime Channels

- **Presence (`/ws`)**: Handles peer joined/left announcements, active speaker indicators, dynamic draw permission requests, and viewport sync messages.
- **Whiteboard Sync (`/yjs`)**: Streams binary Yjs update transactions and awareness states to keep canvas strokes, shapes, and asset metadata synchronized across all participants.

---

## 🛠️ Build & Verification Scripts

```bash
# Run both workspaces concurrently
npm run dev

# Run backend only
npm run dev:server

# Run frontend only
npm run dev:client

# Typecheck and produce production bundles
npm run build

# Generate Prisma client artifacts
npm run prisma:generate
```

---

## 📄 License

MIT © [Sagar Sonewane](https://github.com/Sagar-Sonewane)
