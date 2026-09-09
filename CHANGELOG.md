# Changelog

All notable changes to the StudySync / StudyBoard project will be documented in this file.

## [Unreleased] - 2026-09-09

### Added
- **LiveKit Cloud WebRTC Voice Chat**:
  - Integrated and verified live LiveKit Cloud credentials (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`).
  - Active speaker detection, microphone mute/unmute toggles, and remote audio track subscriptions across room participants.
- **Phase 5.1 — Whiteboard Collaboration Controls**:
  - **Draw Permission Gating**: Guests join locked by default (`isReadonly: true`); requests route via WebSocket to host as a toast with Approve/Deny. Host can also grant or revoke permission anytime via participant rail controls.
  - **Follow-Host Viewport Sync**: Participants follow host camera position on join smoothly via Yjs camera awareness. Panning/zooming breaks away, with "jump to host" one-click return.
  - **Per-User Color Attribution**: Server assigns distinct non-colliding colors from a 10-color palette. Shapes stamped with author metadata; hovering/selecting shapes displays a floating author badge.
  - **Shapes Flyout & Dash Styles**: Fixed Shapes flyout to support Rectangle, Ellipse, Triangle, Diamond, Arrow, and Line. Added solid, dashed, dotted, and sketchy dash styles to Palette flyout.

### Fixed
- **Phase 5.2 — Shape-Drawing Performance Lag**:
  - **Hook Lifecycle Stabilization**: Memoized `whiteboardUser` in `RoomView.tsx` and separated user awareness updates in `yjs-sync.ts` into an independent lightweight effect to prevent teardown and re-instantiation of the Y.Doc and WebSocket connection during active dragging.
  - **Batched Yjs Network Transactions**: Buffered intermediate pointer-move shape records into a 40ms throttled transaction queue (~25fps network rate), with instant flush on `pointerup` or `blur`.
  - **Strict Local Origin Echo Guard**: Filtered local transactions tagged with `'tldraw-local'` in `handleYjsObserver`, preventing feedback loops.
  - **Capped Awareness**: Throttled host camera awareness broadcasts to 50ms intervals (~20fps).
  - **Eliminated React Re-renders**: Guarded `store.listen` in `WhiteboardCanvas.tsx` so React `setState` only triggers on actual value changes, and restricted author attribution calculation to selection changes only.

---

## [Phase 5.0] - 2026-08-23
### Added
- Multiplayer whiteboard synchronization with Yjs CRDT and WebSocket sync server (`/yjs`).
- "Fork My Own Copy" feature allowing users to clone the shared board into a private local document.

---

## [Phase 4.0] - 2026-08-20
### Added
- Infinite whiteboard canvas powered by tldraw with custom UI overrides (~80% width dominance).
- Custom right-rail vertical icon toolbar (Select, Pen, Highlighter, Eraser, Shapes, Text, Notes, Palette, Undo, Redo).

---

## [Phase 3.0] - 2026-08-18
### Added
- 3-state participant rail (Expanded, Collapsed, Hidden) with audio indicators.
- Voice chat integration scaffolding with LiveKit client hook.

---

## [Phase 2.0] - 2026-08-15
### Added
- Realtime WebSocket presence server (`/ws`) for room roster synchronization and status broadcasting.

---

## [Phase 1.0] - 2026-08-12
### Added
- Supabase Auth integration, session token verification middleware, and database tables for profiles, rooms, and participants.

---

## [Phase 0.0] - 2026-08-10
### Added
- Monorepo project setup with React + Vite + Tailwind CSS frontend and Node.js + Express backend.
