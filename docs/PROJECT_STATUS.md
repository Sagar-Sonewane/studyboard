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

---

## Current phase

`Phase 5.1 completed (Whiteboard Collaboration Controls & Shape Tool Fixes) — ready for Phase 6 (File Uploads & Whiteboard Attachment)`

## Environment status

- [x] Supabase project created & configured
- [x] `.env` populated (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`)
- [ ] LiveKit Cloud account/keys set up (runs with built-in graceful fallback simulation when keys are unset)
- [ ] Stripe account/keys set up (not needed until Phase 7)

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
  - Integrated `tldraw` (`@tldraw/tldraw`) engine inside [client/src/components/whiteboard/WhiteboardCanvas.tsx](file:///d:/sagar/studyboard/client/src/components/whiteboard/WhiteboardCanvas.tsx) with custom UI overrides (`hideUi={true}`) for canvas dominance (~80% width).
  - Built custom right-rail vertical icon toolbar [client/src/components/whiteboard/WhiteboardToolbar.tsx](file:///d:/sagar/studyboard/client/src/components/whiteboard/WhiteboardToolbar.tsx) per `/docs/DESIGN.md`:
    - Select, Pen, Highlighter, Eraser, Shapes, Text, Sticky Note, Palette (color & stroke size flyout), Undo, Redo.
  - Added canvas-anchored corner buttons: "upload file" (bottom-left), "fork my board" (bottom-right), and zoom level controls (+ / - / 100% / fit).
- **Phase 5 — Multiplayer whiteboard sync (Yjs CRDT & Board Forking)**:
  - Backend Yjs WebSocket server in [server/src/ws/yjs.ts](file:///d:/sagar/studyboard/server/src/ws/yjs.ts) supporting binary sync protocol (step 1, step 2, update, awareness).
  - Upgraded HTTP server in [server/src/index.ts](file:///d:/sagar/studyboard/server/src/index.ts) to cleanly route `/ws` (presence) and `/yjs` (whiteboard sync).
  - Added board management and forking API endpoints (`GET /api/rooms/:id/boards`, `POST /api/rooms/:id/boards/fork`) in [server/src/routes/rooms.ts](file:///d:/sagar/studyboard/server/src/routes/rooms.ts).
  - Built React Yjs sync hook [client/src/lib/yjs-sync.ts](file:///d:/sagar/studyboard/client/src/lib/yjs-sync.ts) synchronizing `tldraw` store records (`shape`, `binding`, `asset`, `page`) with `Y.Doc` (`Y.Map`).
  - Implemented the "fork my own copy" feature in [client/src/components/whiteboard/WhiteboardCanvas.tsx](file:///d:/sagar/studyboard/client/src/components/whiteboard/WhiteboardCanvas.tsx) with a private workspace mode, top banner indicator, and one-click toggle between shared and personal boards.
- **Phase 5.1 — Whiteboard Collaboration Controls & Shape Tool Fixes**:
  - **Draw permission gating**: Non-host participants join locked (`editor.updateInstanceState({ isReadonly: true })`), showing a "request to draw" button on the right rail. Requests route via WebSocket (`board:draw_permission_requested`) to host as a non-blocking toast with Approve / Deny. Host can also grant or revoke permission anytime via pencil/lock icon toggles in the participant rail. Session-scoped in memory.
  - **Follow-host viewport**: Non-hosts follow host camera position on join smoothly via Yjs awareness. Pan/zoom by a participant immediately breaks away; top indicator provides "stop following" and "jump to host" one-click return.
  - **Per-user attribution**: Non-colliding user color assignment from a 10-color palette on join. Shapes and strokes stamped with `meta: { authorId, authorName, authorColor }`. Hovering or selecting any shape displays a floating author badge (`Created by [Name]`).
  - **Shapes Flyout & Dash Styles**: Fixed Shapes flyout to correctly switch between Rectangle, Ellipse, Triangle, Diamond, Arrow, and Line (`GeoShapeGeoStyle`, `setCurrentTool('arrow')`, `setCurrentTool('line')`). Added `DefaultDashStyle` options (`solid`, `dashed`, `dotted`, `draw`) to the Palette flyout.

## Currently in progress

*(none — Phase 5.1 is completed, verified, and building cleanly with zero errors)*

## Files touched this session

- `server/src/ws/server.ts` — Added color palette assignment, draw permission request/grant/deny/revoke WebSocket handlers and broadcasts
- `client/src/hooks/use-room-presence.ts` — Handled draw permission states, host request queues, and permission dispatchers
- `client/src/components/participants/ParticipantRail.tsx` — Added draw permission status badges, color circles, and host grant/revoke buttons per row
- `client/src/components/whiteboard/WhiteboardToolbar.tsx` — Fixed shapes flyout for all 6 shapes, added stroke dash style selector (solid/dashed/dotted/draw), and locked drawing state UI
- `client/src/components/whiteboard/WhiteboardCanvas.tsx` — Enforced tldraw readonly mode on locked permission, follow-host camera sync, and shape author attribution tooltip
- `client/src/components/room/RoomView.tsx` — Added Host Toast for incoming draw requests with Approve/Deny actions and connected permission controls
- `client/src/lib/yjs-sync.ts` — Added camera awareness broadcasting and automatic shape author metadata tagging

## Known issues / things to revisit

- File uploads & PDF annotation layer to be built in Phase 6.
- Real LiveKit voice has not been tested with live keys yet (currently uses built-in graceful simulation when keys are unset).

## Decisions / discrepancies to be aware of

- The actual project folder on disk is named `studyboard`, not `studysync`.

## Next session should start with

**Proceed to Phase 6 from BUILD_PROMPTS.md (File Uploads & Whiteboard Attachment).**
Phase 6 covers: uploading PDF, images, and documents, rendering them on the canvas as movable assets, and synchronizing file attachments across participants.
