# StudySync — project context docs

Drop this whole folder into your project root as `/docs`. These files give
an AI coding agent (Antigravity, Claude Code, etc.) the full context it
needs without you re-explaining decisions every session.

## Read order for an agent

1. **PRODUCT.md** — what the app is, core flows, roles, plans/limits,
   grace-period behavior, host handoff, what's explicitly out of scope.
2. **DESIGN.md** — UI layout, component states, visual style tokens, copy
   style. Paste the "design-language block" section into any prompt that
   touches UI.
3. **STRUCTURE.md** — tech stack, repo layout, environment variables,
   realtime architecture rules.
4. **DATA_MODEL.md** — database schema reference (users, rooms,
   entitlements, boards, uploaded_files).
5. **API_CONTRACT.md** — REST endpoint names and WebSocket event names/
   payloads, so different build phases stay consistent with each other.
6. **BUILD_PROMPTS.md** — the actual ordered, copy-pasteable prompts to
   build the app phase by phase. This is the file you work through
   top-to-bottom.

## How to use this with Antigravity

- Point the agent at this `/docs` folder at the start of a session (or
  reference it directly, e.g. "read /docs/PRODUCT.md and /docs/DESIGN.md
  before starting").
- Work through `BUILD_PROMPTS.md` one phase at a time — don't paste multiple
  phases at once. Test each phase (with 2+ simultaneous clients for any
  realtime feature) before moving to the next.
- If the agent's output drifts from what's documented here (wrong event
  names, wrong layout proportions, etc.), correct it by pointing back at the
  specific doc/section rather than re-explaining from memory — keeps
  answers consistent across sessions.
- Update these docs as decisions change (e.g. exact day-pass participant
  limit, final pricing) — stale docs are worse than no docs, since the
  agent will trust them over your next message.
