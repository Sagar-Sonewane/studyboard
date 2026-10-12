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

1. **Nav**: logo mark (small circle+checkmark SVG icon) + "StudySync"
   wordmark, left. Center/right nav links (Features, Pricing, For teams).
   Right: "Log in" (ghost button) + "Start a room" (primary, hard-shadow).
2. **Hero** (asymmetric two-column, ~55/45 split):
   - Left: eyebrow text ("for teams, founders & study groups"), oversized
     headline ("Say it. Sketch it. Together." — three short lines, tight
     leading, ~56px, weight 800, with the highlighter mark on "Together"),
     one-paragraph subhead that explicitly covers both work and study use
     cases, an audience chip row (🚀 startups / 💼 remote teams / 📚 study
     groups), primary CTA ("Create a room →") + a no-card-needed reassurance
     line.
   - Right: a tilted (`rotate(2.5deg)`) mock whiteboard preview card — a
     small illustrative SVG with a couple of circles/connector lines and a
     mini sticky note reading something work-plausible ("roadmap v2"), plus
     a small "forked by you" tag peeking off one corner. This doubles as
     product proof, not pure decoration.
3. **"Who it's for" strip**: a quiet 3-column row (plain text, NOT sticky
   notes — deliberately lower-key than the feature section below), ink
   top/bottom border, one line each for startups & small teams / remote &
   WFH employees / study groups.
4. **Features**: 3 tilted sticky notes (see signature devices above) —
   "Talk while you draw", "Fork your own copy", "Mark up any file" — each
   with a one-line description.
5. **Pricing**: 3 ticket-stub cards — Free ($0), Day pass ($3, visually
   emphasized with a filled blue header band and raised position), Monthly
   ($9) — matching the plan structure in PRODUCT.md exactly. Subhead ties
   each plan to a concrete use case (client pitch vs. standing team sync).
6. **Footer CTA**: short bold restatement + primary button, no extra visual
   noise — this section stays quiet since the hero already spent the
   visual energy.

### Copy rules specific to this page

- Audience-neutral by default — don't write a page that reads as
  exclusively for students or exclusively for professionals. The chip row
  is how people self-identify, not separate hero variants.
- Keep sentence case, no exclamation marks, consistent with the rest of
  the product's copy style.

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
