# StudySync — product overview

## What this is

A realtime collaboration web app combining **voice chat** and an **infinite
shared whiteboard** in one room. Built for study groups, but equally for
startups, remote/WFH teams, and freelancers running client sessions —
anywhere a group needs to talk and sketch/plan together without switching
between a call tool and a separate whiteboard tool.

## Core user flow

1. A user creates a room (becomes the **host**) and gets a shareable invite
   link/code.
2. Invited people join via the link — no landing page, no friction, straight
   into a lightweight join screen (enter name → join).
3. Inside the room: everyone can voice chat and draw on a shared infinite
   whiteboard simultaneously.
4. Anyone can **fork** the shared board into a private local copy to work
   solo, without affecting the shared version.
5. Anyone can upload images, PDFs, or docs onto the board; PDFs/docs are
   converted to page images. A separate annotation layer (highlight/pen)
   sits on top of any uploaded file, independently toggleable/undoable.

## Roles

- **Host / admin**: the only person whose plan/entitlement is checked for
  room limits. Only the host sees billing prompts and the "recharge" CTA.
- **Participant**: everyone else. No billing relationship to the room.
- Host can **hand off** the host role to another participant before leaving
  (see grace-period / handoff behavior below).

## Plans & limits (enforced server-side, always — never trust client)

| Plan | Participants | File size cap |
|---|---|---|
| Free | 5 | 10MB |
| Day pass ($3 / 24h, one-time) | higher (define exact number before build) | higher (define before build) |
| Monthly ($9/mo, subscription) | higher / unlimited | higher |

Billing is tied to the **host's account**, not per-participant.

## Grace-period pause flow (when host's entitlement expires mid-session)

1. Backend detects expiry → broadcasts `room:grace_period_started` with a
   server-timestamped deadline (5 minutes out).
2. **Whiteboard locks immediately** (no new writes accepted, enforced
   server-side too).
3. **Voice stays live** during the 5-minute grace period.
4. All clients show a lock overlay with a live countdown. Only the host sees
   a "recharge now" button; others see a passive "waiting on host" message.
5. If the host recharges in time → `room:resumed`, unfreeze immediately.
6. If the timer hits zero → voice disconnects for everyone, with a clear
   "session ended" end-state (never a silent/confusing drop).

## Host leaving / handoff

- **Explicit "Leave" click**, room still has other people in it → modal:
  assign a new admin (dropdown of current participants) or end the meeting
  for everyone. If reassigned, immediately re-check the new host's
  entitlement and broadcast `room:host_changed`.
- **Unexpected disconnect** (network drop) → give a 60-second reconnect
  grace period before treating it as a real departure and triggering the
  same reassignment flow. Don't punish flaky wifi.

## Fork-your-own-copy behavior

- Forking clones the current state of the shared Yjs document into a new,
  local-only document tied to that user.
- Edits on the forked copy never sync back to the shared board unless/until
  a future "merge back" feature is built (not in scope yet — flag as a
  possible v2 feature, don't build speculatively).

## Explicitly out of scope for MVP

- Video tiles (voice-only for now)
- Merge-back of forked boards into the shared board
- Team/org accounts (billing is per-host-account only for now)
- Landing page and marketing site (being built separately, not part of the
  app build phases)

## Build phasing

See `BUILD_PROMPTS.md` for the exact, ordered, copy-pasteable prompts used
to build this incrementally. Do not skip ahead — later phases assume earlier
ones are working and tested with multiple simultaneous clients.
