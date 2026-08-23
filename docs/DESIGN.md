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

## Landing page (separate visual language — for later)

The marketing landing page intentionally breaks from the muted in-app style
to be more expressive, since it has no task-focus to protect:

- Paper/ink palette (`#F7F5EF` paper, `#15162B` ink) with three "marker"
  accents: blue `#3355FF`, yellow `#FFDD33`, coral `#FF5B4C`.
- Display type: Space Grotesk (bold, tight leading). Body: Inter.
- Signature devices: hand-drawn highlighter-stroke behind key headline
  words, hard offset shadows (flat pop-art style, not blurred), tilted
  sticky-note cards for features, ticket-stub cards for pricing.
- Positioning copy must read as audience-neutral by default ("Say it.
  Sketch it. Together.") with a chip row for self-identification (startups /
  remote teams / study groups) rather than separate hero variants.

This is documented in full detail in the design conversation history/mockups
— build this after the core app phases are done, not before.
