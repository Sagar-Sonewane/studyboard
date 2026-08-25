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

---

## Current phase

`Phase 5 completed — ready for Phase 6 (File upload & annotation layer)`

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
    - Select, Pen, Highlighter, Eraser, Shapes (Rectangle, Ellipse, Triangle, Diamond, Arrow, Line), Text, Sticky Note, Palette (color & stroke size flyout), Undo, Redo.
  - Added canvas-anchored corner buttons: "upload file" (bottom-left), "fork my board" (bottom-right), and zoom level controls (+ / - / 100% / fit).
- **Phase 5 — Multiplayer whiteboard sync (Yjs CRDT & Board Forking)**:
  - Backend Yjs WebSocket server in [server/src/ws/yjs.ts](file:///d:/sagar/studyboard/server/src/ws/yjs.ts) supporting binary sync protocol (step 1, step 2, update, awareness).
  - Upgraded HTTP server in [server/src/index.ts](file:///d:/sagar/studyboard/server/src/index.ts) to cleanly route `/ws` (presence) and `/yjs` (whiteboard sync).
  - Added board management and forking API endpoints (`GET /api/rooms/:id/boards`, `POST /api/rooms/:id/boards/fork`) in [server/src/routes/rooms.ts](file:///d:/sagar/studyboard/server/src/routes/rooms.ts).
  - Built React Yjs sync hook [client/src/lib/yjs-sync.ts](file:///d:/sagar/studyboard/client/src/lib/yjs-sync.ts) synchronizing `tldraw` store records (`shape`, `binding`, `asset`, `page`) with `Y.Doc` (`Y.Map`).
  - Implemented the "fork my own copy" feature in [client/src/components/whiteboard/WhiteboardCanvas.tsx](file:///d:/sagar/studyboard/client/src/components/whiteboard/WhiteboardCanvas.tsx) with a private workspace mode, top banner indicator, and one-click toggle between shared and personal boards.

## Currently in progress

*(none — Phase 5 is completed, verified, and building cleanly with zero errors)*

## Files touched this session

- `server/package.json` — Added `yjs`, `y-websocket`
- `server/src/ws/yjs.ts` — Created Yjs WebSocket sync server
- `server/src/ws/server.ts` — Updated presence WebSocket server to support upgrade routing
- `server/src/index.ts` — Attached upgrade router for `/ws` and `/yjs`
- `server/src/routes/rooms.ts` — Added `GET /api/rooms/:id/boards` and `POST /api/rooms/:id/boards/fork`
- `client/package.json` — Added `yjs`, `y-websocket`
- `client/src/lib/api.ts` — Added `fetchBoards` and `forkBoard`
- `client/src/lib/yjs-sync.ts` — Created `useYjsWhiteboardSync` hook for tldraw store <-> Yjs synchronization
- `client/src/components/whiteboard/WhiteboardCanvas.tsx` — Integrated live Yjs multiplayer sync, live/syncing badge, and board forking
- `client/src/components/room/RoomView.tsx` — Passed roomId, user, and session info to WhiteboardCanvas

## Known issues / things to revisit

- File uploads & PDF annotation layer to be built in Phase 6.

## Next session should start with

Start with Phase 6 from BUILD_PROMPTS.md — file upload onto the whiteboard (images, PDFs, documents) with Supabase Storage, multi-page PDF conversion, and an independent toggleable/undoable annotation layer.
