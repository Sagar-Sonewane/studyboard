# StudySync — design spec (in-app product)

This covers the **app UI** (the room/whiteboard/call screen), not the
marketing landing page — the landing page intentionally uses a different,
bolder visual language and is documented separately if/when that's built.

## Layout skeleton (desktop)

```
┌─────────────────────────────────────────────────────────┐
│ Top bar: room name · host badge · pass/timer · count     │
├───────────┬───────────────────────────────────┬─────────┤
│           │                                    │         │
│Participant│                                    │  Tool   │
│  rail     │        Whiteboard canvas           │  rail   │
│ (~200px)  │        (~80% of width)             │ (~52px) │
│           │                                    │         │
├───────────┤                                    │         │
│ call ctrls│                                    │         │
└───────────┴────────────────────────────────────┴─────────┘
```

- Whiteboard is the dominant element — never a small pane fighting for space
  with sidebars.
- Left rail: participant list, top-aligned. Call controls (mic, leave,
  speaker) anchored at the bottom of the rail, near the people they affect.
- Right rail: vertical icon toolbar. Never sideways/rotated text labels.

## Participant rail — three states (user-togglable, persisted per-user)

1. **Expanded** (default on first join): full rows — avatar, name, host
   crown icon, mic status icon.
2. **Collapsed**: avatars only, stacked vertically, no names. Toggle via the
   same arrow control used to expand.
3. **Hidden**: shrinks to a floating pill (stacked avatar previews + count)
   top-left of the canvas. Click to re-expand.

Rule: default to **expanded** for every new room / first-time join. The
collapse/hide state is a *personal* UI preference (not synced to other
participants) — store it client-side (e.g. localStorage or a user-settings
row), never let one person's toggle affect what others see.

## Toolbar (right rail)

Icons only, vertical stack: select/pointer, pen, highlighter, eraser,
shapes, text, divider, undo, redo. No labels needed at this size — use
tooltips on hover.

- **Shapes icon** opens a small flyout (not permanent icons — keep the rail
  minimal) with the shape variants: rectangle, ellipse, line/arrow,
  triangle/diamond. tldraw already supports all of these natively; this is
  a UI wiring task, not new drawing logic.
- **Pen/highlighter tools** show a small style popover when active: stroke
  style (solid / dashed / dotted) and stroke width. tldraw's built-in style
  system already supports dash styles — expose it through this popover
  rather than tldraw's default full style panel, to stay consistent with
  the minimal rail.
- The whole toolbar (and canvas drawing) is disabled/hidden for a
  participant who doesn't currently have draw permission — see "draw
  permission" below.

## Draw permission UI

- A participant without draw permission sees a "request to draw" button in
  place of the toolbar (toolbar itself is hidden/disabled, not just greyed
  out — avoid a toolbar that looks interactive but isn't).
- After requesting, show a quiet "waiting for host" state — don't let them
  spam repeated requests; disable the button until the host responds.
- The **host** sees incoming requests as a small non-blocking notification/
  toast (e.g. "Priya wants to draw — Approve / Deny"), not a modal that
  interrupts whatever the host is doing.
- Once approved, the toolbar appears for that participant immediately
  (server confirms, then broadcasts). The host can revoke permission later
  from the participant list (small "revoke" action next to their name).

## Follow-host viewport indicator

- When a participant is following the host's camera, show a small,
  unobtrusive pill near the top of the canvas: "Following [host name] ·
  stop" — click "stop" (or just pan/zoom manually) to break away.
- When not following, show a quieter "jump to host" pill instead, so it's
  a one-click return rather than manually hunting for where the host is.

## Attribution

- Each participant's live cursor while drawing uses their assigned color
  (consistent for the session) — this is enough to resolve "who's drawing
  this right now" in the moment.
- After a stroke/shape is placed, hovering or selecting it shows a small
  tooltip with the author's name — this covers "who drew this" after the
  fact, once the live cursor is gone.

## Visual style tokens

- Flat surfaces. No gradients, no soft drop shadows.
- 0.5px hairline borders between regions.
- Rounded corners, 8–12px radius.
- Generous whitespace — don't compress the participant rows or toolbar
  icons to save space; let panels collapse instead (see states above).
- Muted neutral base palette + a single accent color for interactive/host
  elements (host crown, active tool, primary buttons).
- **Warning amber, not red**, for anything related to the grace-period /
  lock state — it communicates "time remaining," not "error" or "failure."
  Red is reserved for destructive actions only (e.g. leave/end call button).

## Copy style

- Sentence case everywhere. No exclamation marks.
- Verb-first button labels: "recharge now", not "Recharge Now!".
- Countdown/timer text should be large and use tabular numerals so it
  doesn't jitter as digits change.

## Canvas-anchored actions

Actions that operate directly on the board (upload file, fork my board) are
small **floating buttons anchored to canvas corners** — not buried inside a
menu or modal that pulls focus away from the whiteboard.

## Grace-period lock overlay

- Dimmed background overlay (not solid black) — the frozen board should
  still be visible/legible behind it for context.
- Centered card containing: lock icon, one-line explanation, large countdown
  (tabular numerals), and the action row.
- **Host** sees a "recharge now" button.
- **Everyone else** sees a passive line, e.g. "waiting on [host name] · you
  can keep talking" — never show them a payment button that isn't theirs.
- On timeout (0:00): replace with a final, unambiguous "session ended"
  state — never let voice just silently cut out with no explanation.

## Mobile layout

- Whiteboard fills the entire screen — no persistent side panels.
- Participant rail defaults to the **hidden** floating-pill state (top-left);
  tapping it opens a bottom sheet with the full list.
- Toolbar condenses to a floating icon cluster (top-right) showing the 4
  most-used tools (select, pen, highlighter, upload) with a "more" overflow
  for the rest.
- Call controls (mic, participants, fork board, leave) live in a persistent
  bottom bar sized for thumb reach.

## Design-language block for coding-agent prompts

When asking an AI coding agent to build or touch any UI screen, paste this
block alongside the instructions — agents drift back to generic defaults if
visual direction isn't restated per-prompt:

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

## Landing page — full build spec

The marketing landing page intentionally breaks from the muted in-app style
to be more expressive, since it has no task-focus to protect. This is now
scheduled as **Phase 6.4** in BUILD_PROMPTS.md, before deployment — build
it to this spec exactly, don't freelance a new visual direction.

### Tokens

```css
--paper: #F7F5EF;
--ink: #15162B;
--blue: #3355FF;
--blue-tint: #DCE3FF;
--yellow: #FFDD33;
--yellow-tint: #FFF3C2;
--coral: #FF5B4C;
--coral-tint: #FFDAD5;
--graphite: #6B6D7A;
```

- Display font: **Space Grotesk** (weights 500/700/800), tight letter-
  spacing, used for the headline and section titles.
- Body font: **Inter** (weights 400/500/600/700).
- Both loaded via Google Fonts.

### Signature devices (use consistently, these are what make it distinctive)

- **Hard offset shadow** on buttons, sticky notes, and ticket cards:
  `box-shadow: 4px 4px 0 var(--ink)` with a `2px solid var(--ink)` border —
  flat pop-art style, never a blurred/soft drop shadow.
- **Highlighter-stroke mark** behind one key headline word: an absolutely-
  positioned yellow rectangle behind the word, `transform: skewX(-8deg)
  rotate(-1deg)`, sitting behind the text (negative z-index), covering
  roughly the lower half of the word's height.
- **Tilted sticky notes** for the 3 feature cards: `rotate(-3deg)`,
  `rotate(2deg)`, `rotate(-1.5deg)` respectively, each with a small solid
  ink-colored circle "pushpin" centered at the top edge.
- **Ticket-stub cards** for pricing: rectangular cards with a `2px dashed
  var(--ink)` divider separating the price from what it includes — no
  literal torn-paper edges needed, the dashed divider carries the motif.

### Page sections, in order

1. **Nav**: logo mark (small circle+checkmark SVG icon) + "StudySync" wordmark, left. Nav links: Why (`#features`), How it works (`#how-it-works`), Use cases (`#who-its-for`), Pricing (`#pricing`). Right: "Sign in" + "Create room" (primary, hard-shadow). No duplicate join button in nav.
2. **Hero** (asymmetric two-column layout):
   - Left: oversized headline ("Say it. Sketch it. Together." with the signature yellow highlighter mark on "Together"), two-line subhead (~25 words), primary CTA ("Create a room →" with 4px hard shadow) + outline secondary CTA ("Join with code" with 2px ink border and NO hard shadow), single-line reassurance checks (Free tier included, Guests join without accounts, Works in any browser), and "BUILT FOR:" audience chips (Study Groups, Startups, Remote Teams).
   - Right: authentic collaborative workspace preview resembling the real app UI — window bar with traffic lights, room metadata (`sprint-architecture · room`, `#m7k-42p`), live voice indicator, participant avatars (`S`, `J`, `A`), in-app mode switcher (`Shared` / `My copy`), single coherent scene (one checklist card with 2 of 3 done, one tilted sticky note, two collaborator cursors in open canvas margins, and a red dashed annotation circle cleanly framing an item without touching text; all text ≥ 12px), canvas bottom strip with file upload pill and 100% zoom, realistic floating toolbar, corner badges, and strict 4px hard shadow (`shadow-[4px_4px_0px_#15162B] border-2 border-[#15162B]`).
3. **How it works**: 3 step cards ("Create your room in one click", "Share the link with your group", "Talk, sketch & solve together") with equal-height text containers so horizontal dividers and inner mock panels share the exact same baseline across all cards. Step 2 shows the real server invite code format `code: m7k-42p` and neutral link.
4. **Core capabilities (Features)**: deep dives for voice + canvas integration ("Talk naturally while you draw"), private board forking ("Fork your own copy"), and document annotation ("Drop PDFs onto the canvas with a non‑destructive markup layer"). Non-breaking hyphens (`non‑destructive`) and `[text-wrap:balance]` on all headings. Paragraphs capped at 2 sentences + 3 short bullets. Participant count matches avatar list ("Voice room: 2 connected").
5. **Use cases ("Built for collaboration")**: interactive tabs for Study Groups & Tutors, Startups & Builders, and Remote & Distributed Teams. Remote Teams preview shows authentic freehand sketching (diagram nodes, arrows, sticky note, cursors) rather than a retro table. No fake vote tags, "Actionable/Adopted" labels, "Live Sync" tags, or "Voice Note" cards.
6. **Pricing**: 3 ticket cards (Free $0, Day Pass $3, Monthly Pro $9) aligned evenly at the top with continuous borders and dashed divider (no stray notch arc cutouts). Dead space above dividers tightened. Short deduplicated copy ("Higher participant limit", "Larger file upload size"). Free tier active, Day Pass and Monthly Pro marked "Coming soon" (`aria-disabled="true"`).
7. **Footer CTA**: dark blueprint background ("Your next great idea starts in a room.") with "ZERO SETUP · INSTANT ACCESS" pill and dual action buttons.
8. **Footer**: brand wordmark, concise description, navigation links (Why, How it works, Use cases, Pricing), legal modals (Privacy, Terms, Contact), and "Send feedback" link (`FEEDBACK_URL`).

### Copy & typography rules specific to this page

- **Container width**: all sections share a single `max-width: 1200px` centered container with consistent padding (`px-4 sm:px-6 md:px-8`) and section padding (`py-20 md:py-28`).
- **Typography usage**: Monospace is reserved strictly for short uppercase eyebrow labels and tiny tags (min 12px, letter-spaced). All body text, descriptions, helper lines, and price units use the sans body font (`Inter`). Headings use `Space Grotesk` with `[text-wrap:balance]`.
- **Contrast**: Body text and secondary copy use `#444654` to guarantee WCAG AA > 4.5:1 contrast against `#F7F5EF` paper background.
- **Button hierarchy**: "Create a room →" keeps the signature 4px hard shadow; "Join with code" is strictly an outline button with NO shadow.
- **Jargon ban**: Developer jargon and technical buzzwords ("WebRTC", "CRDT", "master canvas", "image shape", "bindings", "client-side", "low-latency", "crystal clear", "battery-friendly", "no screen-share lag", "zero waiting", "secure study room") are strictly forbidden across all copy and mock previews.
- **Accessibility & Decorative mocks**: All illustrative UI preview cards and diagrams carry `aria-hidden="true"` with non-focusable buttons (`tabIndex={-1}`) to prevent keyboard focus traps.
- **Paid tiers status**: Day Pass ($3) and Monthly Pro ($9) render in a muted, non-clickable "Coming soon" state (`aria-disabled="true"`). "Start free" remains active.
- **Audience-neutral by default**: Speaks to founders, remote teams, and students with equal relevance. Clean "BUILT FOR:" chips for self-identification.

### Routing (how this page fits into the app's navigation)

- `/` → this landing page, shown to anyone not currently in a room.
- `/room/:inviteCode` → **skips this page entirely** — goes straight to
  the lightweight join screen (enter name → join). An invited friend
  should never have to sit through marketing copy to join a session
  someone already started.
- `/app` (or `/dashboard`) → logged-in home: past/active rooms, create new
  room. Not part of this phase's scope unless explicitly asked for — the
  minimum viable version can just redirect a logged-in user straight into
  room creation.
