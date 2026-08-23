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

`Phase 4 completed — ready for Phase 5 (Realtime whiteboard sync)`

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
  - Built-in keyboard shortcuts: `V` (select), `P` (pen), `H` (highlighter), `E` (eraser), `R` (shapes), `T` (text), `N` (sticky note), `Ctrl/Cmd+Z` (undo), `Ctrl/Cmd+Shift+Z` (redo).

## Currently in progress

*(none — Phase 4 is completed and building cleanly with zero errors)*

## Files touched this session

- `client/package.json` — Added `@tldraw/tldraw`
- `client/src/index.css` — Imported `@tldraw/tldraw/tldraw.css`
- `client/src/components/whiteboard/WhiteboardToolbar.tsx` — Created custom right vertical icon toolbar & style popovers adhering to `/docs/DESIGN.md`
- `client/src/components/whiteboard/WhiteboardCanvas.tsx` — Created canvas component integrating Tldraw, tool state sync, and corner action buttons
- `client/src/components/whiteboard/index.ts` — Whiteboard exports
- `client/src/components/room/RoomView.tsx` — Mounted WhiteboardCanvas as dominant center canvas

## Known issues / things to revisit

- Whiteboard drawings are currently local to the client (multiplayer synchronization is the subject of Phase 5 with Yjs / CRDT).

## Decisions made outside the original docs

- Used `Tldraw` with `hideUi={true}` rather than creating a canvas from scratch so we retain first-class infinite canvas capabilities, stylus pressure curves, shape geometry, and direct compatibility with Yjs sync bindings in Phase 5, while driving the UI entirely through our custom StudySync toolbar.

## Next session should start with

Start with Phase 5 from BUILD_PROMPTS.md — multiplayer realtime whiteboard sync using Yjs (y-websocket or custom Yjs provider) and the "fork my own copy" feature.
