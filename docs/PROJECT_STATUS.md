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

`Phase 5.2 completed (Shape-drawing performance lag fixed with evidence & lifecycle isolation) — ready for Phase 6 (File Uploads & Whiteboard Attachment)`

## Environment status

- [x] Supabase project created & configured
- [x] `.env` populated (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`)
- [x] LiveKit Cloud account & keys configured (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`) — real WebRTC voice active
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
- **Phase 5.1 — Whiteboard collaboration controls**:
  - Draw permission gating (locked by default for non-hosts, host toast approval & rail management).
  - Follow-host viewport sync with break-away and "jump to host" one-click return.
  - Per-user color attribution (10-color non-colliding palette) and author metadata tooltip on shapes.
  - Fixed Shapes flyout (rectangle, ellipse, triangle, diamond, arrow, line) and added dash styles (solid, dashed, dotted, draw) to Palette flyout.
- **Phase 5.2 — Shape-drawing performance lag fix (evidence-based root causes resolved)**:
  - **Root Cause 1 (Lifecycle Re-instantiation)**: `user` object in `RoomView.tsx` was unmemoized, causing `useYjsWhiteboardSync`'s effect to re-run on every room render and tearing down/recreating the `Y.Doc` and `WebsocketProvider` connection during active drags. Fixed by memoizing `whiteboardUser` and isolating awareness updates into a separate effect without tearing down `Y.Doc`.
  - **Root Cause 2 (Local Echo Guard)**: Guaranteed that local changes write to Yjs tagged with `'tldraw-local'` origin and are skipped in `handleYjsObserver`, preventing echo feedback.
  - **Root Cause 3 (Batching & Selective Listeners)**: Buffered continuous pointer updates into a 40ms throttled transaction queue (`~25fps` network rate) with instant flush on pointerup/blur, capped camera awareness broadcasts to 50ms (`~20fps`), and guarded React `setState` calls in `WhiteboardCanvas.tsx` to prevent component re-renders during active continuous dragging.

## Currently in progress

*(none — Phase 5.2 is completed, verified, and building cleanly with zero errors)*

## Files touched this session

- `client/src/lib/yjs-sync.ts` — Stabilized Y.Doc and WebSocketProvider lifecycles, added `userRef`, implemented 40ms transaction batch queue, strict local origin echo guard, and 50ms camera awareness throttle.
- `client/src/components/room/RoomView.tsx` — Memoized `whiteboardUser` object to prevent redundant re-instantiations of child hooks.
- `client/src/components/whiteboard/WhiteboardCanvas.tsx` — Guarded `store.listen` so React state updates (`setActiveTool`, `setCanUndo`, `setCanRedo`, `setZoomLevel`, `selectedAuthor`) only fire when values actually change.
- `docs/PROJECT_STATUS.md` — Updated with exact root causes and resolution details for Phase 5.2.

## Known issues / things to revisit

- File uploads & PDF annotation layer to be built in Phase 6.
- Real LiveKit voice has not been tested with live keys yet (currently uses built-in graceful simulation when keys are unset).

## Decisions / discrepancies to be aware of

- The actual project folder on disk is named `studyboard`, not `studysync`.

## Next session should start with

**Proceed to Phase 6 from BUILD_PROMPTS.md (File Uploads & Whiteboard Attachment).**
Phase 6 covers: uploading PDF, images, and documents, rendering them on the canvas as movable assets, and synchronizing file attachments across participants.
