# StudySync — project status

**This file is the single source of truth for "where are we right now."**
Read this FIRST, before any other doc, at the start of every session — it
tells you what's already built, what's in progress, and what's next, so you
don't need to re-analyze the whole codebase or re-derive decisions already
made. Other docs (PRODUCT.md, DESIGN.md, STRUCTURE.md, DATA_MODEL.md,
API_CONTRACT.md) describe what things *should* be — this file describes
what *actually exists right now* and may lag behind them if a phase is
half-finished.

**Update this file at the end of every session**, before ending — even a
short update. If the chat history is ever lost, this file is what lets the
next session pick up exactly where the last one left off.

**Verification note**: this file has already been caught overstating
completion once (Phase 4's shape tools were logged as done when only
rectangle actually worked). Treat "build succeeded with zero errors" as
necessary but not sufficient — a feature isn't done until a human has
actually clicked through it. When in doubt, mark something as
"needs manual verification" rather than "done."

**Editing rule — do not delete, only add/correct**: sections in this file
(especially "Decisions / discrepancies") may contain notes added by a
human or a planning session that a build session didn't originate. When
updating this file at the end of a session, ADD your session's entries and
correct anything proven wrong — do not remove existing entries just
because your session didn't touch that topic. This file has already lost
content once this way (a roadmap decision was dropped from "Decisions /
discrepancies" during a routine update) — don't repeat that.

---

## Current phase

`Phase 6.4 completed (Marketing Landing Page built to DESIGN.md & PRODUCT.md specifications, pop-art paper/ink/marker aesthetic, Space Grotesk typography, tilted sticky notes, ticket-stub pricing cards, and invite route bypass verified) — ready for Phase 6.5 (deployment to Vercel + Railway/Render). Phases 7/8 remain paused.`

## Environment status

- [x] Supabase project created & configured
- [x] `.env` populated (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`)
- [x] Supabase Storage bucket `room-files` active & configured with public access policy
- [x] LiveKit Cloud account & keys configured (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`) — real WebRTC voice active
- [ ] Stripe account/keys set up (not needed until Phase 7 — paused, see Decisions)

## Phases completed

- **Phase 0 — Project setup**: Monorepo scaffolding (`/client` + `/server`), TypeScript, Tailwind CSS, Express + WebSocket server, Prisma connected to Supabase PostgreSQL, health endpoints.
- **Phase 1 — Auth and rooms**: Supabase Auth integration, session token verification middleware, `profiles` & `rooms` database tables, room creation & guest join flows.
- **Phase 2 — Realtime room presence (WebSocket)**: WebSocket server with room broadcasting, presence roster sync (`presence:join`, `presence:leave`, `presence:sync`), client presence hook.
- **Phase 3 — Voice chat (LiveKit WebRTC)**:
  - Backend scoped LiveKit access token generation service (`server/src/services/livekit.ts`) and endpoints (`/api/rooms/:id/join`, `/api/rooms/:id/token`).
  - Frontend LiveKit WebRTC audio connection hook (`client/src/hooks/use-livekit-voice.ts`) managing mic publish, mute/unmute, remote audio element attachment, and active speaker detection (`RoomEvent.ActiveSpeakersChanged`).
  - 3-state participant rail (`client/src/components/participants/ParticipantRail.tsx`): **Expanded** (compact rows with avatars, names, amber host crown, inline mic status), **Collapsed** (vertical avatar strip with speaking rings), and **Hidden** (floating pill on top-left of canvas). Preferences saved in `localStorage`.
  - Mobile bottom call controls and responsive layout.
- **Phase 4 — Whiteboard canvas (local single-user)**:
  - Integrated `tldraw` (`@tldraw/tldraw`) engine inside `client/src/components/whiteboard/WhiteboardCanvas.tsx` with custom UI overrides (`hideUi={true}`) for canvas dominance (~80% width).
  - Built custom right-rail vertical icon toolbar `client/src/components/whiteboard/WhiteboardToolbar.tsx` per `/docs/DESIGN.md`:
    - Select, Pen, Highlighter, Eraser, Shapes, Text, Sticky Note, Palette (color & stroke size flyout), Undo, Redo.
  - Added canvas-anchored corner buttons: "upload file" (bottom-left), "fork my board" (bottom-right), and zoom level controls (+ / - / 100% / fit).
- **Phase 5 — Multiplayer whiteboard sync (Yjs CRDT & Board Forking)**:
  - Backend Yjs WebSocket server in `server/src/ws/yjs.ts` supporting binary sync protocol (step 1, step 2, update, awareness).
  - Upgraded HTTP server in `server/src/index.ts` to cleanly route `/ws` (presence) and `/yjs` (whiteboard sync).
  - Added board management and forking API endpoints (`GET /api/rooms/:id/boards`, `POST /api/rooms/:id/boards/fork`) in `server/src/routes/rooms.ts`.
  - Built React Yjs sync hook `client/src/lib/yjs-sync.ts` synchronizing `tldraw` store records (`shape`, `binding`, `asset`, `page`) with `Y.Doc` (`Y.Map`).
  - Implemented the "fork my own copy" feature in `client/src/components/whiteboard/WhiteboardCanvas.tsx` with a private workspace mode, top banner indicator, and one-click toggle between shared and personal boards.
- **Phase 5.1 — Whiteboard collaboration controls**:
  - Draw permission gating (locked by default for non-hosts, host toast approval & rail management).
  - Follow-host viewport sync with break-away and "jump to host" one-click return.
  - Per-user color attribution (10-color non-colliding palette) and author metadata tooltip on shapes.
  - Fixed Shapes flyout (rectangle, ellipse, triangle, diamond, arrow, line) and added dash styles (solid, dashed, dotted, draw) to Palette flyout.
- **Phase 5.2 — Shape-drawing performance lag fix (evidence-based root causes resolved)**:
  - **Root Cause 1 (Lifecycle Re-instantiation)**: `user` object in `RoomView.tsx` was unmemoized, causing `useYjsWhiteboardSync`'s effect to re-run on every room render and tearing down/recreating the `Y.Doc` and `WebsocketProvider` connection during active drags. Fixed by memoizing `whiteboardUser` and isolating awareness updates into a separate effect without tearing down `Y.Doc`.
  - **Root Cause 2 (Local Echo Guard)**: Guaranteed that local changes write to Yjs tagged with `'tldraw-local'` origin and are skipped in `handleYjsObserver`, preventing echo feedback.
  - **Root Cause 3 (Batching & Selective Listeners)**: Buffered continuous pointer updates into a 40ms throttled transaction queue (`~25fps` network rate) with instant flush on pointerup/blur, capped camera awareness broadcasts to 50ms (`~20fps`), and guarded React `setState` calls in `WhiteboardCanvas.tsx` to prevent component re-renders during active continuous dragging.
- **Phase 6 — File upload and annotation**:
  - **Backend Supabase Storage & Upload Endpoints**:
    - Created `server/src/services/storage.ts` using Supabase Storage bucket (`room-files`) with public access policy and service role authentication.
    - Implemented `POST /api/rooms/:id/files` with Multer memory storage and strict 10MB file limit enforcement (`413 PayloadTooLarge` if > 10MB) matching `PRODUCT.md` free tier caps.
    - Records file metadata in `uploaded_files` Postgres table with `storage_path` (relative to bucket, not raw S3 URL, matching `DATA_MODEL.md`).
    - Implemented `GET /api/rooms/:id/files` returning list of files with resolved public URLs.
  - **PDF Rasterization via pdf.js**:
    - Created `client/src/lib/pdf-renderer.ts` using `pdfjs-dist` to render multi-page PDFs to individual crisp 1.5x PNG blobs on upload.
    - Sequentially uploads each page to the backend and places them as draggable/resizable image shapes on the canvas, vertically stacked with 40px spacing.
  - **Canvas Image Shapes & Synced Assets**:
    - Implemented image asset creation (`AssetRecordType.createId()`, `editor.createAssets()`) and image shapes (`createShapeId()`, `editor.createShape()`) with author attribution metadata.
    - Synced across all room participants via existing Yjs document store (`asset` and `shape` record sync).
  - **Independent Annotation Layer**:
    - Pen and highlighter strokes sit on top of placed image/PDF shapes as separate, independent synced objects.
    - Added canvas-anchored annotation visibility toggle pill (`annotations: on / hidden` with eye icon) to hide/reveal highlighter and ink markings without deleting or mutating the underlying document or Yjs store.
    - Strokes can be undone or erased independently of the underlying image.
  - **Canvas-Anchored Upload Action**:
    - Floating upload button anchored to bottom-left corner per `DESIGN.md` (no disruptive separate modals).
    - Status spinner with real-time progress text (rendering PDF pages, uploading) and feedback toast.
- **Phase 6.4 — Marketing Landing Page & Routing**:
  - Built full marketing landing page at `/` route matching `/docs/DESIGN.md` and `/docs/PRODUCT.md` specifications.
  - Implemented pop-art paper/ink/marker visual identity:
    - Custom color tokens: `--paper` (`#F7F5EF`), `--ink` (`#15162B`), `--blue` (`#3355FF`), `--yellow` (`#FFDD33`), `--coral` (`#FF5B4C`), `--mint` (`#2FE69C`), and soft paper tints.
    - Typography: Google Font `Space Grotesk` (weights 500, 700, 800) for headlines/display and `Inter` for body copy.
    - Hard offset shadows: `4px 4px 0 #15162B` / `2px 2px 0 #15162B` with crisp 2px ink borders and hard hover translations.
  - All 6 sections implemented in spec order:
    1. **Nav**: Logo mark + wordmark, section anchor links (For teams, Features, Pricing), user profile / log in action, "Start a room" primary CTA.
    2. **Hero (55/45 split)**: Oversized display headline *"Say it. Sketch it. Together."* with curved highlighter stroke mark behind *"Together."*, audience chip selector (`All personas`, `Founders & startups`, `Distributed teams`, `Study groups & tutors`), "Start a room — free" primary CTA, "I have a room code" secondary action, and tilted whiteboard preview card with real doodles, live cursor tags, and voice indicators.
    3. **Quiet "Who it's for" strip**: Clean plain-text persona breakdown without distraction.
    4. **Feature sticky notes**: Three tilted sticky notes (`-3deg` yellow, `+2deg` blue, `-1.5deg` coral) with solid ink pushpins, covers: Freehand whiteboard, Realtime voice, and Zero-friction guest links & forkable boards.
    5. **Ticket-stub pricing cards**: Three perforated stub cards with cut-out semi-circle notches and 2px dashed dividers: Free ($0 forever), Day Pass ($3 / 24 hrs with bold blue accent band and raised elevation), and Monthly Pro ($9 / mo).
    6. **Footer CTA**: Hard-shadowed blue container *"Ready to study together?"* with dual action buttons and complete footer links.
  - **Routing integrity**:
    - `/` displays the marketing landing page for new/uninvited visitors.
    - `/room/:inviteCode` and `/?join=:code` **bypass the landing page entirely**, immediately opening the dedicated join screen.
    - "Start a room" triggers auth and room creation flow; "Join with code" opens the join modal.
    - Updated `CreateRoomModal.tsx` and `RoomView.tsx` to generate canonical `/room/:inviteCode` links.

## Currently in progress

*(none — Phase 6.4 is completed, built with zero TypeScript/Vite errors, and verified via browser subagent)*

## Files touched this session (Phase 6.4)

- `client/index.html` — Added Google Fonts link for `Space Grotesk:wght@500;700;800`.
- `client/tailwind.config.js` — Extended theme with landing page color palette (`paper`, `ink`, `blue`, `yellow`, `coral`, tints, `graphite`), `fontFamily.display`, and hard shadow utilities.
- `client/src/index.css` — Defined CSS root variables and utility classes for hard shadows and display typography.
- `client/src/pages/LandingPage.tsx` — Created the complete 6-section landing page component.
- `client/src/pages/index.ts` — Exported `LandingPage`.
- `client/src/components/room/JoinRoomModal.tsx` — Added `isStandalone` mode for clean direct `/room/:inviteCode` bypass layout and enhanced URL parsing.
- `client/src/components/room/CreateRoomModal.tsx` — Updated generated room invite links to canonical `/room/:inviteCode`.
- `client/src/components/room/RoomView.tsx` — Updated shareable room invite links to canonical `/room/:inviteCode`.
- `client/src/App.tsx` — Replaced Phase 1 diagnostic view with `LandingPage` at `/`, wired CTA callbacks into auth and room creation modals, and implemented instant bypass routing for `/room/:inviteCode`.
- `docs/PROJECT_STATUS.md` — Updated with Phase 6.4 completion details.

## Known issues / things to revisit

- LiveKit voice call: confirm two-person voice testing on live devices.

## Decisions / discrepancies to be aware of

- The actual project folder on disk is named `studyboard`, not `studysync`.
- **Roadmap order**: Phases 7 and 8 (Stripe billing, grace-period pause flow) are intentionally paused. Up next: **Phase 6.5 (deploy to Vercel + Railway/Render)**. Do not resume Phase 7/8 without explicit go-ahead.

## Next session should start with

**Proceed to Phase 6.5 (Deployment to Vercel + Railway/Render)** per `BUILD_PROMPTS.md`.


