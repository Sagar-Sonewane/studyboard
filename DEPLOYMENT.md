# StudySync — Full Production Deployment Guide

This guide contains the step-by-step instructions for deploying StudySync to production for friend-testing and team collaboration.

---

## Architecture & Hosting Split

Because StudySync combines a client-side SPA with real-time multiplayer WebSockets and voice streaming, it uses a **split-hosting architecture**:

| Component | Platform | Why |
|---|---|---|
| **Frontend (`/client`)** | **Vercel** | Fast global CDN distribution for the React + Vite static bundle. Client-side SPA routing managed via `client/vercel.json`. |
| **Backend (`/server`)** | **Railway** or **Render** | Persistent Node.js + Express process required for long-lived WebSocket connections (`ws` for presence/broadcasts, `y-websocket` for Yjs whiteboard sync). *Vercel Serverless Functions cannot be used for the backend because they terminate connections and do not support stateful WebSockets.* |
| **Database & Auth** | **Supabase** | Managed PostgreSQL (accessed via Prisma ORM), Supabase Auth, and Supabase Storage buckets. |
| **Realtime Voice** | **LiveKit Cloud** | Low-latency WebRTC SFU audio streaming with free cloud tier. |
| **Billing** | **Stripe** | *Intentionally paused for friend-testing (Phases 7/8). Variables remain unset.* |

---

## Prerequisites Checklist

Before beginning, ensure you have:
1. Your repository pushed to GitHub.
2. Accounts created on:
   - [GitHub](https://github.com)
   - [Supabase](https://supabase.com)
   - [LiveKit Cloud](https://cloud.livekit.io)
   - [Railway](https://railway.app) (or [Render](https://render.com))
   - [Vercel](https://vercel.com)

---

## Step 1: Database & Supabase Setup

### 1.1 Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a **New Project**.
2. Note your **Database Password** securely.
3. Choose a region closest to your primary user base.

### 1.2 Get Database Connection String
1. In your Supabase Dashboard, go to **Project Settings** → **Database**.
2. Under **Connection string**, select **URI**.
3. Copy the URI and replace `[YOUR-PASSWORD]` with your real database password:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```
   *(If using Supabase Connection Pooler on port 6543, ensure `pgbouncer=true` is appended if required by Prisma).*

### 1.3 Apply Prisma Migrations
From your local terminal, apply the database schema to your Supabase instance:
```bash
cd server
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require" npx prisma migrate deploy
```
*(Alternatively, you can run `npx prisma db push`).*

### 1.4 Configure Storage Bucket
1. In Supabase Dashboard, go to **Storage** → **Buckets**.
2. Click **New bucket**.
3. Bucket name: `room-files`
4. Toggle **Public bucket** to `ON` (or configure appropriate row-level read policies for room participants).

### 1.5 Retrieve Supabase API Credentials
Go to **Project Settings** → **API**:
- **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
- **anon public key**: `eyJhbG...` (safe for frontend)
- **service_role secret**: `eyJhbG...` (backend only — keep secret!)

---

## Step 2: LiveKit Voice Cloud Setup

1. Log in to [LiveKit Cloud](https://cloud.livekit.io).
2. Create a new project (e.g. `studysync-voice`).
3. Under **Settings** → **Keys**:
   - Generate a new API Key pair.
   - Record:
     - **LiveKit URL**: `wss://[YOUR-PROJECT-SUBDOMAIN].livekit.cloud`
     - **API Key**: `API...`
     - **API Secret**: `secret...`

---

## Step 3: Deploy Backend to Railway (or Render)

### Option A: Railway (Recommended)

1. Log in to [Railway](https://railway.app) and click **New Project**.
2. Select **Deploy from GitHub repo** and choose your repository (`studyboard`).
3. Click on the newly created service and open **Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm run build` *(runs `prisma generate && tsc`)*
   - **Start Command**: `npm start` *(runs `node dist/index.js`)*
4. Go to the **Variables** tab and add the environment variables:

| Variable Name | Example Value | Description |
|---|---|---|
| `PORT` | `4000` | Server listening port (Railway also assigns `PORT` dynamically) |
| `NODE_ENV` | `production` | Production mode |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require` | Supabase Postgres URL |
| `SUPABASE_URL` | `https://[YOUR-PROJECT-REF].supabase.co` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Secret Service Role Key |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase Anon Key |
| `LIVEKIT_URL` | `wss://[YOUR-PROJECT].livekit.cloud` | LiveKit Server WSS URL |
| `LIVEKIT_API_KEY` | `API...` | LiveKit API Key |
| `LIVEKIT_API_SECRET` | `secret...` | LiveKit API Secret |
| `CORS_ORIGIN` | `https://*.vercel.app` | Allowed client origins (or leave blank to use automatic `*.vercel.app` detection) |

5. Under **Settings** → **Networking** → **Public Networking**:
   - Click **Generate Domain** (e.g. `https://studyboard-server-production.up.railway.app`).
   - Copy this URL — you will need it for the frontend.

6. **Verify Backend Health**:
   Open a browser or run:
   ```bash
   curl https://<your-railway-domain>/api/health
   ```
   You should see:
   ```json
   {
     "status": "healthy",
     "service": "studysync-server",
     "database": { "connected": true }
   }
   ```

---

### Option B: Render (Alternative)

1. Log in to [Render](https://render.com) → **New** → **Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Name**: `studysync-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Starter (required for persistent WebSockets — free tier spins down on idle).
4. Add the same Environment Variables as listed in the Railway table above.

---

## Step 4: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Import your GitHub repository (`studyboard`).
3. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: click **Edit** and select `client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
4. Expand **Environment Variables** and add:

| Variable Name | Value | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://[YOUR-PROJECT-REF].supabase.co` | Frontend Supabase client |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (Anon public key) | Frontend auth & bucket uploads |
| `VITE_API_URL` | `https://<your-backend-railway-domain>` | Backend HTTP REST endpoints |
| `VITE_WS_URL` | `wss://<your-backend-railway-domain>` | Presence & Yjs WebSocket connections |

*(Note: The client automatically upgrades `ws:` to `wss:` when loaded over HTTPS, but defining `wss://` explicitly ensures optimal connection speeds).*

5. Click **Deploy**.
6. Vercel will build the frontend and provide your production URL (e.g. `https://studyboard.vercel.app`).
   *Note: `client/vercel.json` contains single-page application rewrites so that `/room/:code` routes work directly without 404s.*

---

## Step 5: Final Cross-Service Linking & CORS Verification

1. Go back to your **Railway / Render backend dashboard**.
2. Update the `CORS_ORIGIN` variable to include your exact deployed Vercel domain:
   ```
   CORS_ORIGIN=https://studyboard.vercel.app
   ```
   *(Note: The server in `server/src/index.ts` automatically permits all `*.vercel.app` origins by default, so preview deployments will work out of the box).*
3. If you configure a custom domain (e.g. `https://studysync.app`), append it to `CORS_ORIGIN`.

---

## Step 6: Full Smoke Test Protocol

Perform the following smoke tests with two devices or two separate browser profiles:

1. **Landing Page Load**:
   - Navigate to `https://<your-vercel-domain>/`.
   - Confirm page renders with ivory background, hard shadows, 0 console errors, and no CJK characters.
2. **Room Creation (Host)**:
   - Click **Create a room**.
   - Authenticate (or use guest/dev profile).
   - Enter room name and click **Create room**.
   - Confirm immediate redirect to `https://<your-vercel-domain>/room/[code]`.
3. **Guest Join**:
   - Copy the invite link (`https://<your-vercel-domain>/room/[code]`).
   - Open in an incognito window or on a mobile phone.
   - Confirm the landing page is bypassed directly to the lightweight join card.
   - Enter guest name and click **Join Room**.
4. **Multiplayer Whiteboard Drawing**:
   - Draw shapes, lines, or pen strokes on device A.
   - Confirm real-time Yjs sync on device B within milliseconds.
   - Verify active participant avatars appear in the header and participant sidebar.
5. **Realtime Voice**:
   - Unmute microphone on device A.
   - Verify green speaking pulse illuminates around participant avatar on both screens.
   - Verify audio transmission between devices.
6. **Board Forking**:
   - Click **Fork board** on device B.
   - Confirm transition to private board banner.
   - Draw test marks on device B and confirm device A's shared board remains untouched.
   - Toggle back to **Shared board**.
7. **Document / PDF Upload**:
   - Click **Upload file** in the canvas bottom-left corner.
   - Upload a sample PDF or image.
   - Confirm upload succeeds to Supabase `room-files` bucket and pages render onto the canvas.

---

## Troubleshooting & Common Pitfalls

| Issue | Root Cause | Solution |
|---|---|---|
| **Mixed Content Warning / WebSocket fails** | Connecting to `ws://` from an `https://` site | Ensure `VITE_WS_URL` uses `wss://` and backend is behind HTTPS/TLS (Railway provides this automatically). |
| **Direct link to `/room/:code` shows 404 on Vercel** | SPA router missing rewrite rule | Ensure `client/vercel.json` exists with rewrites to `/index.html`. This is already committed in the repo. |
| **Prisma error: `Client not generated` on Railway** | `prisma generate` not executed during build | In `server/package.json`, `build` is configured as `"prisma generate && tsc"`. Ensure Railway runs `npm run build`. |
| **CORS blocked error in browser console** | Backend rejecting client origin | Check `CORS_ORIGIN` in backend environment variables. The server code in `server/src/index.ts` automatically permits all `*.vercel.app` domains. |
| **Voice connects but no audio** | Firewall / UDP port blockage | LiveKit Cloud uses TURN servers automatically. Ensure the client browser has microphone permissions granted. |

---

## Summary of Environment Variables

### Client (`client/.env`)
```bash
VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
VITE_API_URL="https://your-backend.up.railway.app"
VITE_WS_URL="wss://your-backend.up.railway.app"
```

### Server (`server/.env`)
```bash
PORT=4000
NODE_ENV=production
CORS_ORIGIN="https://your-frontend.vercel.app"

DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require"
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret"
SUPABASE_ANON_KEY="your-anon-public-key"

LIVEKIT_URL="wss://[YOUR-PROJECT].livekit.cloud"
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
```
