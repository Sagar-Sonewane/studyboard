# StudySync — API & WebSocket event contract

Reference for endpoint/event names so different build phases stay
consistent with each other. Adjust payload shapes as needed, but keep
names stable once other phases depend on them.

## REST endpoints

### Auth

Handled by Supabase Auth directly via the frontend client SDK
(`@supabase/supabase-js`) — **no custom `/api/auth/*` endpoints**. The
frontend calls `supabase.auth.signUp()` / `supabase.auth.signInWithPassword()`
etc. directly against Supabase.

For backend requests that need to know who's calling, the client sends the
Supabase session token; the backend verifies it using Supabase's
server-side helper (don't hand-roll JWT verification — use the library
Supabase provides for this). A verified request gives you the caller's
`profiles.id` to use in subsequent queries/permission checks.

### Rooms
- `POST /api/rooms` — create room (authenticated) → { id, invite_code }
- `GET /api/rooms/:inviteCode` — resolve invite code → room info (for the
  join screen, before the user is authenticated/connected)
- `POST /api/rooms/:id/join` — join as guest or authenticated user
- `POST /api/rooms/:id/end` — host-only, ends the room for everyone
- `PATCH /api/rooms/:id/host` — reassign host (body: { new_host_id })

### Files
- `POST /api/rooms/:id/files` — multipart upload; server validates size
  against current entitlement before accepting, then uploads to Supabase
  Storage using the service role key (client never uploads directly)
- `GET /api/rooms/:id/files` — list files on a room's board(s)

### Billing
- `POST /api/billing/checkout/day-pass` — creates Stripe Checkout session
  (one-time mode) → { checkout_url }
- `POST /api/billing/checkout/monthly` — creates Stripe Checkout session
  (subscription mode) → { checkout_url }
- `POST /api/billing/webhook` — Stripe webhook receiver. Handles:
  - `checkout.session.completed` → create/extend entitlement
  - `customer.subscription.updated` → sync entitlement status
  - `customer.subscription.deleted` → mark entitlement cancelled/expired

## WebSocket events

Namespace events by room: clients subscribe per `room_id` on connect.

### Presence
- `presence:join` (server → clients) — `{ user_id | guest_name, joined_at }`
- `presence:leave` (server → clients) — `{ user_id | guest_name }`
- `presence:mic_status` (client → server → clients) — `{ user_id, muted: boolean }`
- `presence:speaking` (client → server → clients) — `{ user_id, speaking: boolean }` (driven by LiveKit audio-level events)

### Whiteboard (in addition to raw Yjs sync traffic on its own channel/provider)
- `board:locked` (server → clients) — sent as part of grace period, see below
- `board:unlocked` (server → clients)

### Grace period / billing state
- `room:grace_period_started` (server → clients) — `{ deadline: ISO timestamp, host_id }`
  - Client behavior on receipt: freeze whiteboard writes, show lock overlay
    with countdown to `deadline`, show "recharge now" only if
    `current_user_id === host_id`.
- `room:resumed` (server → clients) — dismiss lock overlay, resume whiteboard writes
- `room:voice_closed` (server → clients) — sent when the grace period
  deadline passes with no recharge; client should force-disconnect from
  LiveKit and show the final "session ended" state

### Host handoff
- `room:host_leave_prompt` (server → the leaving host only) — sent when they
  click "Leave" and other participants remain; expects a response within a
  short client-side timeout or defaults to "end meeting"
- `room:host_changed` (server → clients) — `{ new_host_id }`
- `room:ended` (server → clients) — room torn down, disconnect everyone

## Server-authoritative rules (repeat in any relevant build prompt)

- Every state-changing event above originates from the **server**, not the
  client — the client requests an action via REST/WS, the server validates
  it (entitlement checks, permission checks) and only then broadcasts the
  resulting state change to all clients, including the requester.
- Whiteboard writes during a `board:locked` state must be rejected at the
  Yjs-sync-server layer, not just hidden in the UI.
