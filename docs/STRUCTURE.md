# StudySync — technical structure

## Stack

- **Frontend**: React + Vite + Tailwind CSS, TypeScript.
- **Whiteboard**: tldraw (preferred — has a maintained Yjs binding) or
  Konva/Fabric.js if building the canvas from scratch.
- **Realtime whiteboard sync**: Yjs (CRDT) + y-websocket (or y-webrtc)
  provider. One Yjs document per room. This is custom-built regardless of
  the backend choice below — nothing off-the-shelf does CRDT sync for you.
- **Voice**: LiveKit (self-hostable, generous free cloud tier) or Mediasoup
  if self-hosting is a hard requirement from day one.
- **Backend**: Node.js + Express, WebSocket layer (ws or socket.io) for
  room presence, whiteboard sync, and grace-period/host-handoff broadcasts.
- **Database**: **Supabase-hosted PostgreSQL**, accessed via **Prisma ORM**
  for all app-specific tables (rooms, entitlements, boards, uploaded_files).
  Supabase's own client SDK is *not* used for general data access — Prisma
  is the single data-access layer for app tables, to keep type safety and
  avoid mixing two query styles. See "Supabase hybrid approach" below.
- **Auth**: **Supabase Auth** — email/password, OAuth, magic links handled
  by Supabase directly. Replaces a custom JWT implementation.
- **File storage**: **Supabase Storage** for uploaded images/PDF-page
  renders (S3-compatible under the hood, works within the same Supabase
  project as auth/db — one dashboard, one bill).
- **PDF handling**: pdf.js to rasterize PDF pages to images client- or
  server-side before placing them on the canvas, then upload the rendered
  images to Supabase Storage.
- **Doc-to-PDF conversion** (for Word/etc. uploads): Gotenberg or
  LibreOffice headless, server-side, before feeding into the PDF path.
- **Payments**: Stripe (Checkout — one-time mode for day pass, subscription
  mode for monthly pass).

## Supabase hybrid approach — what this means in practice

We're using Supabase for **Auth + Storage + hosted Postgres**, but keeping
**Prisma** as the query layer for all app-specific tables. This avoids
fully committing to Supabase's client SDK for data access (which would
increase lock-in) while still getting fast, ready-made auth and storage.

- **Auth flow**: frontend uses the Supabase client SDK (`@supabase/supabase-js`)
  directly for signup/login/session management — no custom JWT endpoints
  needed. Supabase issues its own session tokens; the backend verifies
  these on incoming requests (Supabase provides a helper for this) rather
  than minting its own JWTs.
- **User identity**: Supabase Auth owns `auth.users` (its own internal
  table — don't touch it directly). We maintain a `public.profiles` table
  (defined in DATA_MODEL.md) that mirrors the subset of user data our app
  needs (display_name, etc.), kept in sync via a Postgres trigger that
  fires on `auth.users` insert. All our own foreign keys (rooms.host_id,
  entitlements.user_id, etc.) point to `profiles.id`, which equals the
  corresponding `auth.users.id`.
- **Guest joins**: our app allows joining a room without an account (see
  PRODUCT.md). This does **not** go through Supabase Auth at all — guests
  are handled purely at the application level via `room_participants.guest_name`
  with a null `user_id`, exactly as already specified in DATA_MODEL.md.
  Do not use Supabase's anonymous-auth feature for this — it's unnecessary
  complexity for what's just a display name.
- **Storage**: uploaded files go to a Supabase Storage bucket via the
  Supabase client SDK (server-side, using the service role key) rather than
  a raw S3 SDK. Bucket access policies (public read for room files, or
  signed URLs) are configured in the Supabase dashboard.
- **Database access**: Prisma connects to the Supabase Postgres instance
  via its standard connection string (`DATABASE_URL`). Run
  `prisma migrate` against it exactly as you would against a local Postgres
  instance — Supabase's Postgres is not special-cased for Prisma.
- **What's NOT used from Supabase**: Supabase Realtime (Postgres change
  broadcasts) is not part of this stack — our realtime needs (whiteboard
  sync, presence, grace-period events) are custom-built via our own
  WebSocket layer, as described in "Realtime architecture notes" below.

## Repo layout (monorepo)

```
/studysync
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── whiteboard/
│   │   │   ├── participants/
│   │   │   ├── voice/
│   │   │   └── room/
│   │   ├── hooks/
│   │   ├── lib/              # Yjs setup, LiveKit client wrapper, Supabase client, API client
│   │   ├── pages/
│   │   └── App.tsx
│   └── package.json
├── server/                  # Node.js + Express + WebSocket backend
│   ├── src/
│   │   ├── routes/           # REST endpoints (rooms, uploads, billing — no custom auth routes)
│   │   ├── ws/                # WebSocket handlers (presence, whiteboard sync,
│   │   │                       grace-period broadcasts, host handoff)
│   │   ├── services/          # LiveKit token gen, Stripe webhooks, entitlement checks,
│   │   │                       Supabase auth-token verification, Supabase storage upload helper
│   │   ├── prisma/            # schema.prisma, migrations (run against Supabase Postgres)
│   │   └── index.ts
│   └── package.json
├── docs/                    # ← this folder — product/design/structure context
│   ├── PROJECT_STATUS.md    # ← read this first, always — living session log
│   ├── PRODUCT.md
│   ├── DESIGN.md
│   ├── STRUCTURE.md
│   ├── DATA_MODEL.md
│   ├── API_CONTRACT.md
│   └── BUILD_PROMPTS.md
└── README.md
```

Note: no `docker-compose.yml` for local Postgres — Supabase provides a
hosted instance (and a local CLI/Docker setup of its own, `supabase start`,
if you want an offline dev environment later, but that's optional, not
required to begin building).

## Environment variables (expected — fill in real values in `.env`, never commit)

```
DATABASE_URL=                      # Supabase Postgres connection string, used by Prisma
SUPABASE_URL=
SUPABASE_ANON_KEY=                 # used by the frontend client
SUPABASE_SERVICE_ROLE_KEY=         # backend only — never expose to the client
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_DAY_PASS_PRICE_ID=
STRIPE_MONTHLY_PRICE_ID=
```

## Realtime architecture notes

- **Room presence** (who's connected) is separate from **voice** (LiveKit)
  and separate from **whiteboard sync** (Yjs) — three distinct realtime
  concerns, don't conflate them into one channel/event type.
- Presence can live in-memory per server instance for MVP; move to Redis
  pub/sub only once you need multiple server instances (don't build this
  prematurely).
- Every WebSocket event that affects room state (grace period start/end,
  host change, resume) should be **server-authoritative** — the client
  reacts to broadcasts, it never decides these states locally.
- Whiteboard writes must be validated/rejected server-side during a lock
  state, not just hidden in the UI — a client bypass (devtools) shouldn't be
  able to draw during a locked/paused room.

## Realtime sync performance guidelines

Added after a real regression: Phase 5.1 introduced visible lag when
dragging to draw/resize shapes. Apply these from the start for any future
continuous-drag sync (Phase 6's annotation layer draws the same way):

- **Throttle or batch document sync during an active drag** (~30-60ms
  intervals) rather than syncing on every pointer-move — an unthrottled
  drag can fire dozens of network messages per second for a single shape.
  Alternatively, apply intermediate frames locally-only and finalize the
  synced state on pointer-up.
- **Use the diff tldraw's `store.listen` already gives you** — don't
  re-serialize or re-diff the whole store on every change.
- **Batch related updates into a single `Y.Doc.transact()` call** instead
  of one transaction per point/frame — each transaction fires its own
  'update' event over the wire.
- **Keep presence/awareness broadcasts (cursor position, follow-host
  camera) on a separate, lighter-weight, capped channel** (~20-30
  updates/sec) from full document sync — don't let cursor-tracking
  granularity dictate document-sync granularity.
- **Any per-shape metadata work (author tags, permission checks) belongs
  at creation/action time, not recomputed on every intermediate drag
  frame.**
- When adding a new continuous-input feature (freehand pen, annotation
  strokes, drag-resize), profile it with two simultaneous clients before
  calling it done — a feature that's smooth locally can still flood the
  sync channel once it's actually going over the wire.

## Testing discipline

- Every realtime feature (presence, voice, whiteboard sync, grace period,
  host handoff) must be tested with **two or more simultaneous clients**
  (two browser tabs/profiles minimum) before being considered done — bugs
  in this app are overwhelmingly multiplayer-only and invisible with a
  single client.
