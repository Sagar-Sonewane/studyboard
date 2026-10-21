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

`Phase 6.7 in progress / deployment ready (Frontend configured for Vercel with vercel.json rewrites and wss:// dynamic derivation; Backend configured for Railway/Render with Prisma build pipeline and full Vercel CORS support). Ready for deployment linking and smoke testing. Phases 7/8 remain paused.`

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
- **Phase 6.5 — Premium Product-Led Homepage Redesign**:
  - **Modular Architecture**: Refactored monolithic `LandingPage.tsx` into focused, reusable components under `client/src/components/landing/`:
    - `LandingHeader.tsx`: 72px sticky nav, responsive anchor links, auth state chip, sign in/out, and mobile drawer.
    - `HeroWorkspacePreview.tsx`: Authentic collaborative canvas preview featuring real-time moving collaborator cursors (`motion`), animated audio pulse wave for Sarah (host), architecture diagrams, sticky roadmap note, and forked copy indicator.
    - `ProblemSolutionSection.tsx`: Clear side-by-side comparison contrasting tool fatigue (separate call apps + whiteboard tabs) with the unified StudySync room.
    - `HowItWorksSection.tsx`: 3-step visual workflow (Create room, Share link, Talk & sketch together).
    - `FeatureDeepDiveSection.tsx`: Interactive capability deep dives for natural voice integration, private board forking, and non-destructive PDF annotation layers.
    - `AudienceUseCasesSection.tsx`: Interactive tabs with tailored canvas previews for Study Groups & Tutors, Startups & Builders, and Remote Teams.
    - `PricingSection.tsx`: Ticket-stub pricing cards powered by `PLAN_LIMITS` with Free $0 active, Day Pass $3 & Monthly $9 honestly marked "Coming soon", and host-pays reassurance.
    - `FinalCtaSection.tsx`: Bold closing call to action ("Your next great idea starts in a room.") with dual action buttons.
    - `LandingFooter.tsx`: Branded footer with legal modals (Privacy, Terms, Contact) and founder feedback link.
  - **Dependencies**: Added `motion` (`^14.2.0`) to `client/package.json` for smooth, accessible micro-interactions with `useReducedMotion()` fallback support.
  - **Visual & Narrative Polish**: Preserved warm ivory (`#F7F5EF`), ink navy (`#15162B`), electric blue (`#3355FF`), and yellow highlighter (`#FFDD33`) tokens while establishing strict visual hierarchy, comfortable line lengths, and consistent elevation shadows.
  - **Verification**: Verified zero TypeScript errors with `npm run build` and performed full visual audit at 1920x1080 (desktop) and 375x812 (mobile) viewports using `browser_subagent`. Verified room creation and join modal interactions.
  - **Content & Trust**: Note: while initial jargon cleanup began here, several instances of developer jargon ("WebRTC", "CRDT", "master canvas", "image shape", "bindings", "client-side", "low-latency", "crystal clear", "battery-friendly") and "Popular for:" had regressed/remained in components until the subsequent Landing Page QA Fixes pass.
  - **Plausible Hero Preview**: Initial pass introduced work/study sticky notes and badges; full layout decollision, single coherent scene unification, and strict 4px hard shadow were completed in the subsequent QA pass.
  - **Honest Positioning & Config**: Configured `client/src/config/landing.ts` containing `PLAN_LIMITS` and `FEEDBACK_URL` with TODO comments for future Stripe launch. Paid tiers ("Day Pass", "Monthly Pro") set to muted non-clickable "Coming soon" (`aria-disabled="true"`). (Note: the audience chip header label originally rendered "Popular for:" until corrected to "BUILT FOR:" in the QA pass).
  - **Hero Subhead**: Tightened to 2 lines (~25 words) covering voice + whiteboard for both work and study.
  - **Layout & 1200px Unified Container**: All sections (Nav, Hero, Strip, Features, Pricing, Footer CTA, Footer) share a single `max-w-[1200px]` centered container with matching horizontal padding. Nav heightened to 72px with paper bg and 1px ink border. Nav links smooth-scroll to anchors.
  - **Pricing Alignment**: Equal-height cards (`items-stretch`) with pinned bottom CTA buttons and uniform `#3355FF` checkmarks.
  - **Button Hierarchy**: "Create a room" keeps the hard shadow; "Join with link / code" is an outline button with no shadow.
  - **Typography & Accessibility**: Monospace restricted strictly to uppercase eyebrow labels and tiny tags (min 12px, letter-spaced). Body copy in `Inter` (min 14px, paragraphs 16px, max ~65ch wide). Darkened graphite to `#444654` for > 4.5:1 WCAG AA contrast. Full semantic landmarks, focus rings, and prefers-reduced-motion support.
  - **Pre-deploy SEO & Assets**: Created SVG favicon (`/favicon.svg`), 1200x630 Open Graph preview SVG (`/og-image.svg`), Open Graph and Twitter Card meta tags in `index.html`. Added Privacy, Terms, and Contact modals plus configurable "Send feedback" link and "© 2026 StudySync".
  - **Branded 404**: Unknown routes render a branded paper/ink 404 screen with a link home.
  - **Visual Verification**: Verified across 1920px desktop and 375px mobile viewports with zero horizontal scroll, functioning mobile menu, and confirmed route bypass for `/room/:code`.

- **Phase 6.6 — Application-Wide Design System Unification**:
  - **Shared Design Tokens**: Extended the homepage's warm paper (`#F7F5EF` / `#FAF8F3`), ink navy (`#15162B`), electric blue (`#3355FF`), sketch yellow (`#FFDD33`), and hard offset shadow system throughout all in-app components via `client/src/index.css`.
  - **Room Workspace Header** (`RoomView.tsx`): 56px warm paper bar with brand logo mark, Space Grotesk session name, live room pulse badge, `#FFDD33` host crown badge, quick invite-code pill with copy feedback, and styled leave action.
  - **3-State Participant Sidebar** (`ParticipantRail.tsx`): Completely updated the hidden floating pill, collapsed avatar strip, and expanded roster panel with warm paper backgrounds, 2px ink navy borders, speaking indicator pulse rings, host crowns, drawing permission lock/unlock toggles, and microphone states.
  - **Whiteboard Toolbar & Floating Controls** (`WhiteboardToolbar.tsx`, `WhiteboardCanvas.tsx`): Floating paper toolbar with 2px ink navy border, hard shadows, electric blue active tool states, shapes flyout, and color/stroke palette flyout. Kept the drawing canvas predominantly clean white (`bg-white`) for maximum contrast and legibility. Updated floating bottom-left controls (file upload, annotation toggle, zoom) and bottom-right board forking controls.
  - **Unified Dialogs & Modals**:
    - `AuthModal.tsx`: Warm ivory card, 2px ink borders, `hard-shadow-xl`, brand mark, segmented tab switcher, styled inputs, and development host profile selector.
    - `CreateRoomModal.tsx`: Room creation form with host warnings and room-created success ticket with copyable invite link.
    - `JoinRoomModal.tsx`: Both the modal popup and standalone `/room/:inviteCode` route unified with active room details preview, guest name input, and error states.
  - **Verification**: Verified production build with `tsc && vite build` (zero errors) and verified in-browser rendering across landing page, modals, and room workspace.

- **Phase 6.7 — Production Deployment Readiness**:
  - **Dynamic Protocol & WebSocket Derivation** (`client/src/lib/api.ts`, `client/src/lib/yjs-sync.ts`):
    - Ensured `API_BASE_URL`, `WS_BASE_URL`, and Yjs provider connection dynamically adapt to deployment environments.
    - Added automatic upgrade from `ws:` to `wss:` when loaded over HTTPS (preventing browser mixed-content blocks).
    - Added fallback derivation from `VITE_API_URL` if `VITE_WS_URL` is omitted, eliminating broken WebSocket connections across staging and production.
  - **Vercel SPA Routing Configuration** (`client/vercel.json`):
    - Added single-page application rewrites to prevent 404s when navigating directly to `/room/:inviteCode` or reloading a live session on Vercel.
  - **Backend Production CORS & Build Pipeline** (`server/src/index.ts`, `server/package.json`):
    - Updated CORS middleware to accept comma-separated origins, explicit `CORS_ORIGIN`, and automatically allow all Vercel deployment preview domains (`*.vercel.app`).
- **Phase 6.8 — Landing Page QA Fixes & Visual Verification**:
  - **CJK Character Removal**: Scanned all codebase files (`client/src`, `client/public`, `client/index.html`, SVGs, OG image) for CJK ranges (U+4E00-U+9FFF). Located stray Chinese text (`实时同步`) on the SVG connector line in `HeroWorkspacePreview.tsx` and removed it. Set `editorInstance.user?.updateUserPreferences?.({ locale: 'en' })` in `WhiteboardCanvas.tsx` to force tldraw locale to English. Confirmed `<html lang="en">` is configured.
  - **Jargon & False Claims Purge**:
    - Removed all instances of prohibited terms: `WebRTC`, `CRDT`, `image shape`, `bindings`, `client-side`, `master canvas`, `RFC`, `low-latency`, `crystal clear`, `battery-friendly`, `no screen-share lag`, `zero waiting`, and `secure study room`.
    - Removed non-existent feature representations: vote counts, "Actionable" / "Adopted" tags, "Live Sync" badge, and "Voice Note" callout card.
    - Removed redundant `ProblemSolutionSection` to prevent feature duplication and ungrounded claims about single-drawer tools.
    - Fixed data inconsistencies: updated participant status to "Voice room: 2 connected" matching the 2 participants (Sarah and Jordan). Replaced "MATH101" with authentic server invite code format `m7k-42p` and neutral link `studyboard.live/room/m7k-42p`.
    - Corrected "POPULAR FOR:" to "BUILT FOR:".
    - Unified navigation names: changed footer "Workflow" to "How it works", and changed footer "Share feedback with founders" to "Send feedback".
  - **Hero Preview Decollision & Unification**:
    - Replaced dual Architecture/Checklist tabs with authentic in-room view switcher (`Shared` / `My copy`).
    - Unified into ONE coherent work planning scene: single checklist card ("Sprint Review Objectives" with 2 of 3 done), single sticky note ("Launch Notes 📌" with 3 bullets), two collaborator cursors ("Jordan" in red, "Alex" in yellow) positioned in clear canvas margins, and a red dashed annotation circle neatly encircling "Instant guest join links" without touching or overlapping text.
    - Replaced blurred drop shadow with strict 4px hard offset shadow (`shadow-[4px_4px_0px_#15162B] border-2 border-[#15162B]`).
    - Repositioned corner badges ("forked by you" and "ambient voice") so they never overlap the toolbar or get clipped by edges.
    - Left column streamlined: removed eyebrow pill to eliminate subhead duplication, capped subhead at 2 lines (~25 words), kept reassurance checks to one line, and styled "Join with code" as an outline button with NO hard shadow.
  - **Layout & Section Alignment**:
    - `HowItWorksSection`: Aligned horizontal dividers and inner mock panels across all 3 step cards using unified text block heights. Removed "02 ·" number from eyebrow.
    - `PricingSection`: Dropped stray ticket-notch arc cutouts outside card edges in favor of a clean continuous border with dashed divider. Tightened dead space above dividers. Aligned all 3 cards evenly at the top (removed `md:-translate-y-2` on Free card). Deduplicated copy in Day Pass and Monthly Pro. Removed "Unlimited persistent rooms" and "pause anytime".
    - Headings: Applied non-breaking hyphens (`non‑destructive`) and `[text-wrap:balance]` across all section headings. Removed section numbers from eyebrows for visual consistency.
    - `AudienceUseCasesSection`: Replaced retro table in Remote Teams tab with authentic freehand sketching scene (flow diagram, arrows, sticky note, cursor).
  - **Navigation & Accessibility**:
    - Streamlined navigation to 4 links: `Why` (`#features`), `How it works` (`#how-it-works`), `Use cases` (`#who-its-for`), `Pricing` (`#pricing`).
    - Trimmed action buttons to "Sign in" and single primary "Create room" CTA (dropped duplicate "Join room").
    - Marked all decorative mock preview containers with `aria-hidden="true"` and non-focusable buttons (`tabIndex={-1}`) to eliminate keyboard traps.
  - **Multi-Viewport Visual Verification**: Verified in browser at 1920px (desktop wide), 1280px (standard desktop), 768px (tablet), and 375px (mobile). Confirmed zero horizontal scroll (`document.documentElement.scrollWidth <= clientWidth`), zero text overlaps, functioning mobile menu, and confirmed that `/room/:code` directly bypasses the landing page to the dedicated join screen.

## Currently in progress

*(Phase 6.8 QA Fixes Complete — Ready for Deployment linking)*

## Files touched this session (Phase 6.7 Deployment Preparation)

- `client/src/lib/api.ts` — Dynamic API and WebSocket URL resolution with HTTPS/WSS enforcement.
- `client/src/lib/yjs-sync.ts` — Resilient Yjs WebSocket URL derivation with WSS support.
- `client/vercel.json` — Vercel SPA rewrite configuration for deep routing (`/room/:code`).
- `server/src/index.ts` — Comprehensive CORS configuration supporting Vercel preview and production origins.
- `server/package.json` — Automated `prisma generate && tsc` build pipeline.
- `docs/PROJECT_STATUS.md` — Logged deployment preparation phase.

## Known issues / things to revisit

- LiveKit voice call: confirm two-person voice testing on live devices.

## Decisions / discrepancies to be aware of

- The actual project folder on disk is named `studyboard`, not `studysync`.
- **Hosting split**: Frontend on Vercel (`client/`), Backend on Railway or Render (`server/`) for persistent WebSocket support.
- **Roadmap order**: Phases 7 and 8 (Stripe billing, grace-period pause flow) remain paused until friend-testing validation completes.

## Next session should start with

**Execute deployment linking on Vercel and Railway/Render, set environment variables, and perform cross-device smoke testing.**


