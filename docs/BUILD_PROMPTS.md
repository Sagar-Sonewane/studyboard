# StudySync — step-by-step build prompts

Use these one at a time, in order. Each is designed to be a self-contained prompt you can hand to an AI coding agent (Antigravity, Claude Code, etc.). Test/run after each phase before moving to the next — don't stack unverified phases.

**These files are meant to live in `/docs` at the project root.** Every
phase prompt below opens with a "Read first" line naming the exact docs it
depends on — keep that line in when you paste the prompt. Agents follow a
concrete file path far more reliably than a design block pasted once
earlier in the conversation and never referenced again.

---

## Design language reference (paste this into every UI-related prompt)

Keep this block handy and paste it alongside any phase that touches UI (2, 3, 4, 6, 10). Coding assistants forget visual direction fast if it's not restated.

```
Design language for StudySync:
- Layout: whiteboard is the dominant element (~80% of width on desktop),
  never a small pane fighting for space with sidebars.
- Left rail: participant list as compact rows (avatar, name, host crown icon,
  mic status icon) — not big square video-style tiles. Must support 3 states:
  expanded (full rows), collapsed (avatars only, vertical strip), and hidden
  (floating pill with stacked avatars + count, top-left of canvas). Default
  to expanded on first join; remember the user's last choice after that.
- Right rail: vertical icon toolbar (select, pen, highlighter, eraser,
  shapes, text, undo/redo) — never sideways/rotated text labels.
- Top bar: room name, host badge, pass/timer status, participant count.
- Visual style: flat surfaces, no gradients or drop shadows, 0.5px hairline
  borders, generous whitespace, rounded corners (8-12px). Muted neutral
  palette with a single accent color for interactive/host elements; warning
  amber (not red) for the grace-period/lock state, since it's a "time
  remaining" state, not an error.
- Buttons/actions that live directly on the canvas (upload, fork my board)
  are small floating buttons anchored to the canvas corners, not buried in
  menus.
- Copy style: sentence case everywhere, no exclamation marks, verb-first
  button labels (e.g. "recharge now", not "Recharge Now!").
- Mobile: whiteboard fills the screen; participant rail becomes a floating
  pill by default; toolbar condenses to a floating icon cluster; call
  controls (mic, participants, fork, leave) sit in a persistent bottom bar.
```

---

## Phase 0 — Project setup

```
Read first: /docs/PRODUCT.md and /docs/STRUCTURE.md (especially the
"Supabase hybrid approach" section).

Set up a new full-stack TypeScript project for a realtime collaboration app.
Frontend: React + Vite + Tailwind CSS.
Backend: Node.js + Express + WebSocket (ws or socket.io).
Database/Auth/Storage: a Supabase project (I will create the project in the
Supabase dashboard and provide the URL, anon key, service role key, and
Postgres connection string as environment variables — do not attempt to
provision Supabase infrastructure yourself).
Set up Prisma in the backend pointed at the Supabase Postgres connection
string via DATABASE_URL. Set up the folder structure for a monorepo with
/client and /server workspaces per /docs/STRUCTURE.md. Add basic
health-check routes and a "hello world" React page to confirm the stack
runs end to end, including a successful Prisma connection to the Supabase
database. No docker-compose.yml is needed for Postgres since Supabase
hosts it.
```

---

## Phase 1 — Auth and rooms

```
Read first: /docs/DATA_MODEL.md (profiles, rooms tables — note profiles
mirrors auth.users, it is NOT a custom users table) and
/docs/API_CONTRACT.md (auth section — Supabase-handled, no custom
endpoints) and /docs/STRUCTURE.md (Supabase hybrid approach section, in
full, before writing any auth code).

Integrate Supabase Auth on the frontend using @supabase/supabase-js:
signup and login via supabase.auth.signUp() / signInWithPassword() —
do NOT build custom /api/auth/* endpoints or a custom JWT system. Set up
the `profiles` table (id, display_name, created_at) matching
/docs/DATA_MODEL.md, plus the Postgres trigger that inserts a profiles row
whenever a new row is created in auth.users. On the backend, add a
middleware that verifies the incoming Supabase session token (using
Supabase's server-side verification helper) and resolves it to a
profiles.id for use in subsequent queries.

Then add room creation: a `rooms` table matching /docs/DATA_MODEL.md (id,
name, host_id → profiles.id, invite_code, status, created_at). Build the
room endpoints named in /docs/API_CONTRACT.md to create a room and generate
a shareable invite link (unique invite code). Add a simple "create room"
and "join room via link" flow on the frontend — remember that joining via
link must also support unauthenticated guests (see PRODUCT.md), who do not
go through Supabase Auth at all.
```

---

## Phase 2 — Realtime room presence (WebSocket)

```
Read first: /docs/API_CONTRACT.md (presence event names/payloads) and
/docs/DESIGN.md (participant rail layout and three-state behavior).

Add a WebSocket server that manages room presence: when a user joins a room,
broadcast their join to everyone else in that room; same for leave. Track
connected participants per room in memory (or Redis if you want it
production-ready). Build the participant list UI component that updates
live as people join/leave, following /docs/DESIGN.md exactly — compact
rows, not video-style tiles, with the three-state (expanded/collapsed/
hidden) toggle behavior described there.
```

---

## Phase 3 — Voice chat (WebRTC)

```
Read first: /docs/STRUCTURE.md (voice stack choice) and /docs/DESIGN.md
(participant rail — mic status placement).

Integrate LiveKit (or Mediasoup if self-hosting) for realtime voice chat.
Set up token generation on the backend so a joining user gets a scoped
LiveKit access token for their room. Build the frontend audio connection:
join/leave voice, mute/unmute, and a speaking indicator per participant tied
to LiveKit's audio level events. Wire this into the participant list UI so
each row shows mic status, following /docs/DESIGN.md (icon-based mic status
inline in each row, not a separate video-tile grid).
```

---

## Phase 4 — Whiteboard canvas (local only, no sync yet)

```
Read first: /docs/DESIGN.md (layout skeleton and toolbar section) and
/docs/STRUCTURE.md (whiteboard library choice).

Add an infinite whiteboard using tldraw (or Konva/Fabric.js if you prefer
building from scratch) as a React component. Support pan, zoom, freehand
drawing (pen tool), and basic shapes. No multiplayer sync yet — just get a
single-user canvas working smoothly. Build the toolbar (select, pen,
highlighter, eraser, shapes, text, undo/redo) as a vertical icon rail
following /docs/DESIGN.md — no sideways text, no buried menus for
frequently-used tools.
```

---

## Phase 5 — Realtime whiteboard sync (the hard part)

```
Read first: /docs/PRODUCT.md (fork-your-own-copy behavior) and
/docs/DATA_MODEL.md (boards table — is_shared, forked_from_board_id, owner_id).

Add multiplayer sync to the whiteboard using Yjs with a y-websocket (or
y-webrtc) provider, connected per room. Each room has its own Yjs document.
Make sure two browser tabs in the same room see each other's strokes live
with no conflicts. Also implement the "fork my own copy" feature: a button
that clones the current Yjs doc state into a new local-only doc the user can
edit privately, without affecting the shared board.
```

---

## Phase 5.1 — Whiteboard collaboration controls (fixes found after Phase 5 testing)

```
Read first: /docs/PROJECT_STATUS.md in full — note the correction there:
Phase 4 was logged as having a working Shapes flyout (ellipse, triangle,
diamond, arrow, line) but hands-on testing found only rectangle actually
works. Don't trust that earlier claim; verify by testing yourself. Also
read /docs/PRODUCT.md ("Whiteboard collaboration controls" section),
/docs/DESIGN.md ("Draw permission UI", "Follow-host viewport indicator",
and "Attribution" sections), and /docs/API_CONTRACT.md (the whiteboard
event list, including presence:join's new `color` field and the new
board:draw_permission_* events).

We're using tldraw, so most of this is wiring up existing tldraw
capability through our UI, not building drawing logic from scratch. Four
fixes:

1. Draw permission (locked by default): add participant-level draw
   permission that defaults to false for everyone except the host. Use
   tldraw's readonly mode (editor.updateInstanceState({ isReadonly: true }))
   for any participant without permission — this hides/disables their
   toolbar and blocks edits. Add a "request to draw" button shown instead
   of the toolbar when locked. Implement the WebSocket events from
   /docs/API_CONTRACT.md: board:draw_permission_requested (client to host),
   and board:draw_permission_granted / denied / revoked (server broadcasts).
   Host sees incoming requests as a non-blocking toast with Approve/Deny.
   Host can revoke permission from the participant list at any time. This
   state is session-scoped only — do not persist it to the database, it
   resets to locked on reconnect.

2. Follow-host viewport: participants should default to following the
   host's camera when they join. Use tldraw's built-in
   editor.startFollowingUser(hostUserId) — this works off tldraw's existing
   multiplayer presence sync, no new backend event needed. Any participant
   can break away by panning/zooming themselves or clicking "stop
   following" on the indicator pill described in /docs/DESIGN.md. When not
   following, show a "jump to host" pill instead for a one-click return.

3. Per-user attribution: when a participant joins, the server assigns them
   a color from a fixed palette (avoiding collisions with currently
   connected users) and includes it in the presence:join payload per
   /docs/API_CONTRACT.md. Use this color for their live tldraw cursor.
   Also tag each shape/stroke with an authorId in its meta field so that
   hovering or selecting a shape after the fact shows a small tooltip with
   the author's name, even after their live cursor is gone.

4. Shapes flyout — actually build it, and add dash style: despite an
   earlier status note claiming rectangle/ellipse/triangle/diamond/arrow/
   line were all working from Phase 4, hands-on testing confirmed only
   rectangle actually works. Wire the Shapes flyout to tldraw's other
   native shape tools (ellipse, triangle, diamond, arrow, line) — these
   already exist in tldraw, this is UI wiring to expose them via the
   flyout, not building shape-drawing logic from scratch. After fixing
   this, click through each shape yourself and confirm it draws correctly
   before marking it done — do not rely on "the build compiled" as
   evidence a UI control works. Separately, the Palette flyout currently
   only exposes color and stroke size — add tldraw's built-in dash style
   options (solid / dashed / dotted) to that same flyout.

Test all four with two simultaneous browser tabs — this phase is entirely
about multiplayer behavior and won't show real bugs with a single client.
For item 4 specifically, also manually click through every shape tool
yourself; a successful build is not evidence a button works.
```

---

## Phase 6 — File upload and annotation

```
Read first: /docs/DATA_MODEL.md (uploaded_files table — note storage_path,
not a raw S3 URL) and /docs/DESIGN.md (canvas-anchored actions section) and
/docs/STRUCTURE.md (storage section of the Supabase hybrid approach).

Add file upload to the whiteboard: images upload to a Supabase Storage
bucket via the backend using the service role key (never upload directly
from the client with a public key, since the size/entitlement check must
happen server-side first) and render as draggable/resizable shapes on the
canvas. For PDFs, use pdf.js to render each page to an image on upload,
then place each page as an image shape, uploading each rendered page to the
same Supabase Storage bucket. Add a highlighter/annotation layer that sits
on top of these shapes as separate synced objects (not baked into the
image), so annotations can be toggled or undone independently. Enforce a
10MB file size limit server-side (not just client-side), matching the
free-tier limit in /docs/PRODUCT.md. Place the upload button as a small
floating button anchored to the canvas corner, per /docs/DESIGN.md — not
in a separate menu/modal that takes focus away from the board.
```

---

## Phase 7 — Plans, limits, and Stripe integration

```
Read first: /docs/DATA_MODEL.md (entitlements table — exact fields) and
/docs/API_CONTRACT.md (billing endpoints and webhook handling section).

Add an `entitlements` table matching /docs/DATA_MODEL.md exactly (user_id,
type: day_pass/monthly, status, starts_at, expires_at,
stripe_subscription_id, stripe_checkout_session_id). Integrate Stripe
Checkout: one-time payment mode for a 24-hour day pass, subscription mode
for a monthly pass, using the endpoint names in /docs/API_CONTRACT.md. Add
webhook handlers for checkout.session.completed and
customer.subscription.updated/deleted to keep entitlements in sync.
Enforce server-side, per the limits table in /docs/PRODUCT.md: free tier =
5 participants max, 10MB file cap; active entitlement = higher limits.
Check entitlement at room-join and file-upload time — query for
`status = active AND expires_at > now()`, never trust a cached client-side
flag.
```

---

## Phase 8 — Grace-period pause flow

```
Read first: /docs/PRODUCT.md (grace-period pause flow section) and
/docs/API_CONTRACT.md (grace period / billing state events) and
/docs/DESIGN.md (grace-period lock overlay section).

Add a background check (interval or scheduled job) that detects when a
host's entitlement expires. On expiry, broadcast `room:grace_period_started`
exactly as specified in /docs/API_CONTRACT.md — a server-timestamped
deadline (5 minutes out), not a raw seconds count. On receiving this, the
frontend should: freeze the whiteboard (stop accepting/sending Yjs updates,
and reject writes server-side too), show a lock overlay with a live
countdown synced to the deadline, and display a "recharge now" button only
to the host (others see a "waiting on host" message) — exactly as described
in /docs/DESIGN.md. Style the overlay per /docs/DESIGN.md: dimmed
background (not solid black), centered card, amber warning color (not red,
since time still remains), large tabular-number countdown, sentence-case
copy. When the timer hits zero, broadcast `room:voice_closed`, disconnect
all participants from the LiveKit room via the server API, and show a final
"session ended" state (not just a silent disconnect). On successful payment
webhook, broadcast `room:resumed` and unfreeze everything immediately.
```

---

## Phase 9 — Host handoff on leave

```
Read first: /docs/PRODUCT.md (host leaving / handoff section) and
/docs/API_CONTRACT.md (host handoff events).

When the host clicks "leave," send `room:host_leave_prompt` and show a
modal requiring them to either assign a new admin from the current
participant list, or end the meeting for everyone (default to "end
meeting" if they don't respond within a short timeout). Update
rooms.host_id on reassignment and re-run the entitlement check against the
new host immediately, broadcasting `room:host_changed` per
/docs/API_CONTRACT.md. If ended instead, broadcast `room:ended`. Separately,
handle unexpected disconnects (network drop): give a 60-second reconnect
grace period before treating it as a real departure and triggering the same
reassignment flow — don't punish a dropped wifi connection instantly.
```

---

## Phase 10 — Responsive / mobile layout

```
Read first: /docs/DESIGN.md (mobile layout section, in full).

Make the whiteboard the full-screen focal point on mobile breakpoints.
Collapse the participant list into a floating pill (avatars + count,
top-left) that expands into a bottom sheet on tap. Condense the tool rail
into a floating icon cluster (top-right) showing only the 4 most-used
tools, with a "more" overflow. Move call controls (mic, participants, fork
board, leave) into a persistent bottom bar sized for thumb reach. Follow
the flat, hairline-border, rounded-corner visual style and copy style
described in /docs/DESIGN.md throughout.
```

---

## Notes on order

- Don't skip straight to Phase 5 (Yjs sync) — get Phase 4's local canvas smooth first, since debugging sync issues on top of a shaky canvas is much harder.
- Phase 7 and 8 depend on each other's tables/events — build them together if the gap between them feels awkward.
- Test each phase with **two browser tabs / two devices** before moving on — most of the bugs in this app are multiplayer-only and won't show up with a single user.
