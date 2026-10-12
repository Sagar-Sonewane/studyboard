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

## Phase 5.2 — Fix shape-drawing performance lag (attempt 2 — evidence-first)

```
Read first: /docs/PROJECT_STATUS.md in full, including the note that a
first attempt at this fix (throttling/batching guesses) was already tried
and did NOT resolve the lag. Do not reapply the same class of fix without
first gathering evidence that it addresses the actual bottleneck — guessing
again wastes another cycle.

The lag is still present after the first fix attempt. This time, diagnose
before touching any code:

## Step 1 — Instrument and measure
Add temporary counters/logging (remove before finishing) around:
- how many times the tldraw store.listen callback fires during one 3-second
  shape drag
- how many times Y.Doc.transact() (or equivalent) is called during that
  same drag
- how many WebSocket messages are actually sent during that same drag
- how many times the Yjs document's 'update' observer fires and re-applies
  changes back onto the tldraw store during that same drag (this last one
  is the important one — see Step 2)

Report these four numbers before making any further changes. If any of
them is far higher than "once or twice per meaningful change," that's your
lead.

## Step 2 — Check specifically for a missing echo guard
This is the most common root cause of exactly this symptom in a
Yjs-tldraw binding, and may be why the first throttling attempt didn't
help (throttling reduces frequency but doesn't stop a feedback loop):

When a LOCAL tldraw change is written into the Yjs doc, is that write
tagged with a local origin (e.g. `ydoc.transact(() => {...}, localOrigin)`)?
And when the Yjs 'update' observer fires to apply changes onto the tldraw
store, does it check the transaction's origin and SKIP re-applying it if
the origin matches the local one (since that change is already reflected
in the tldraw store — it originated there)?

If this origin-check guard is missing or broken, every local edit gets
echoed back through Yjs and re-applied to the tldraw store as if it were a
remote change. This can trigger store.listen again, which re-syncs to
Yjs again, compounding with every pointer-move during a drag — this would
explain lag that throttling alone doesn't fix, since the loop happens
per-change regardless of how infrequently changes are sent.

Fix this specifically if found: tag local-origin transactions and filter
them out in the observer, applying only genuinely remote changes back to
the tldraw store.

## Step 3 — Verify the first fix attempt is actually in place and working
Confirm the throttling/batching changes from the first attempt weren't
accidentally reverted, gated behind something inactive, or applied to the
wrong layer (e.g. throttled the outbound network send but not an
expensive CPU-bound local computation, which would still lag with zero
network messages).

## Step 4 — Profile
Capture a browser Performance tab recording (or React DevTools Profiler)
during a shape drag. Identify the top 2-3 functions by self-time or the
longest tasks on the timeline. Note what they are before fixing further —
don't fix based on assumption once you have profiler data available.

## Step 5 — Isolate local-only vs sync-caused
Test dragging a shape with the Yjs sync temporarily disabled (or with only
one client connected, no remote peer). If the lag disappears, the cause is
in the sync layer. If it persists even fully local/solo, the cause is
elsewhere (tldraw config, an unrelated expensive re-render, something in
Phase 5.1's attribution/permission code running in the render path).

## Fix and verify
Fix based on what Steps 1-5 actually showed — not based on the same
guesses as last time. Verify smoothness with two simultaneous browser
tabs, for both the person drawing and the person watching. Update
/docs/PROJECT_STATUS.md with the ACTUAL root cause found (not just "fixed
performance") so this doesn't need re-diagnosing again if it resurfaces.
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

## Phase 6.4 — Build the landing page

```
Read first: /docs/DESIGN.md ("Landing page — full build spec" section, in
full — it has exact color tokens, fonts, component specs, and section-by-
section content) and /docs/PRODUCT.md ("Routing / navigation structure"
section).

Build the marketing landing page at the `/` route, to the spec in
/docs/DESIGN.md exactly — don't invent a new visual direction, this page
has an intentionally distinctive design (paper/ink/marker palette, hard
offset shadows, tilted sticky notes, ticket-stub pricing cards, a
highlighter-stroke mark behind one headline word) that differs from the
muted in-app UI on purpose, and it's already fully specified.

Implement all six sections in order: nav, hero (with the tilted whiteboard
preview card and audience chip row), the quiet "who it's for" strip, the
three feature sticky notes, the three pricing ticket-stubs (matching the
actual plan prices in PRODUCT.md), and the footer CTA.

Wire up routing per PRODUCT.md: `/` shows this page; `/room/:inviteCode`
must continue to bypass it entirely and go straight to the join screen —
confirm this still works after adding the landing page, don't accidentally
route invite links through it. "Create a room" and "Start a room" CTAs on
this page should lead into the existing signup/room-creation flow.

This is a static marketing page — it doesn't need any of the realtime/
whiteboard/voice machinery, so there's no need to test with two browser
tabs for this phase. Do a visual check yourself against the spec (colors,
fonts, hard-shadow style, tilted sticky notes) rather than just confirming
it builds without errors.
```

---

## Phase 6.5 — Deploy for friend-testing

```
Read first: /docs/STRUCTURE.md ("Deployment" section, in full).

Deploy the app for real-world friend-testing, following the hosting split
in /docs/STRUCTURE.md exactly — frontend to Vercel, backend to Railway or
Render (NOT Vercel, since the backend needs persistent WebSocket support
that Vercel's serverless functions don't provide).

1. Deploy /client to Vercel: connect the repo, set build root to /client,
   configure the env vars listed in STRUCTURE.md's Deployment section.
2. Deploy /server to Railway or Render: connect the repo, set build root
   to /server, configure the backend env vars (DATABASE_URL,
   SUPABASE_SERVICE_ROLE_KEY, LIVEKIT_API_KEY/SECRET, etc.) — leave Stripe
   vars unset for now, billing is intentionally paused.
3. Update backend CORS to allow the deployed Vercel origin.
4. Confirm the frontend's WebSocket/Yjs connection code builds its URLs
   from env vars (using wss://) rather than any hardcoded
   ws://localhost reference — fix if hardcoded.
5. Smoke-test the full flow on the deployed URLs: sign up, create a room,
   invite link works for a guest join, voice connects, whiteboard syncs
   between two real separate devices/networks (not just two tabs on one
   machine — this is the first real test of latency across an actual
   network, not localhost).

Report the final Vercel URL and backend URL once deployed and smoke-tested.
```

---

**Phases 7 and 8 (billing and the grace-period pause flow) are
intentionally PAUSED after Phase 6.5.** Do not start them without explicit
go-ahead — the plan is to gather feedback from friend-testing on the
free-tier experience first, since there's no value building a payment flow
around limits that haven't been validated yet. See PROJECT_STATUS.md for
current status before resuming here.

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
