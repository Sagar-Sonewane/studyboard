# StudySync — data model

Rough schema reference — adjust field names/types as Prisma migrations
evolve, but keep this file in sync so coding agents don't reinvent the
model from scratch each session.

**Auth note**: user identity/auth is handled by Supabase Auth
(`auth.users`), not a custom table — see `profiles` below and
STRUCTURE.md's "Supabase hybrid approach" section for the full explanation.

## `profiles` (mirrors the subset of `auth.users` our app needs)

| field | type | notes |
|---|---|---|
| id | uuid, pk | **same value as `auth.users.id`** — not a separate identity |
| display_name | string | |
| created_at | timestamp | |

Populated automatically via a Postgres trigger on `auth.users` insert (set
this up as a Supabase migration, not manually). All app tables that need a
"user" foreign key (rooms.host_id, entitlements.user_id, etc.) reference
`profiles.id`. Never create a separate custom users table — that would
duplicate what Supabase Auth already owns and cause the two to drift out of
sync.

## `rooms`

| field | type | notes |
|---|---|---|
| id | uuid, pk | |
| name | string | |
| host_id | uuid, fk → profiles.id | current host/admin — reassignable |
| invite_code | string, unique | used to build the shareable join link |
| status | enum | `active` / `paused` / `ended` |
| created_at | timestamp | |

## `room_participants` (join table, tracks who's currently/has been in a room)

| field | type | notes |
|---|---|---|
| id | uuid, pk | |
| room_id | uuid, fk → rooms.id | |
| user_id | uuid, fk → profiles.id, nullable | nullable to allow guest joins without account |
| guest_name | string, nullable | used when user_id is null — guests never touch Supabase Auth at all, see STRUCTURE.md |
| joined_at | timestamp | |
| left_at | timestamp, nullable | |

## `entitlements`

| field | type | notes |
|---|---|---|
| id | uuid, pk | |
| user_id | uuid, fk → profiles.id | the host who purchased |
| type | enum | `day_pass` / `monthly` |
| status | enum | `active` / `expired` / `cancelled` |
| starts_at | timestamp | |
| expires_at | timestamp | for day_pass: starts_at + 24h. For monthly: managed via Stripe subscription status, but still cache an expires_at for fast reads |
| stripe_subscription_id | string, nullable | monthly only |
| stripe_checkout_session_id | string, nullable | day_pass only |
| created_at | timestamp | |

Lookup pattern: to check if a host currently has elevated limits, query for
an entitlement where `user_id = host_id AND status = 'active' AND
expires_at > now()`. Don't rely on "did they pay once" — always check
current validity.

## `boards` (Yjs document reference — the doc content itself lives in
whatever Yjs persistence backend you choose, e.g. y-websocket's
LevelDB/Postgres persistence adapter; this table just tracks metadata)

| field | type | notes |
|---|---|---|
| id | uuid, pk | |
| room_id | uuid, fk → rooms.id | |
| is_shared | boolean | true = the room's main shared board |
| forked_from_board_id | uuid, nullable, fk → boards.id | set when a user forks their own copy |
| owner_id | uuid, nullable, fk → profiles.id | set on forked (personal) boards; null for the shared board |
| created_at | timestamp | |

## `uploaded_files`

| field | type | notes |
|---|---|---|
| id | uuid, pk | |
| board_id | uuid, fk → boards.id | which board (shared or forked) it's placed on |
| uploaded_by | uuid, fk → profiles.id | |
| storage_path | string | path within the Supabase Storage bucket (not a raw S3 URL) — construct the public/signed URL from this at read-time |
| file_type | enum | `image` / `pdf_page` / `doc_converted` |
| original_filename | string | |
| size_bytes | integer | enforce 10MB free-tier cap server-side against this |
| created_at | timestamp | |

## Notes

- Guests (no account) can join rooms via invite link with just a display
  name — `room_participants.user_id` stays null in that case, and no
  Supabase Auth session exists for them at all. Decide before Phase 1
  whether guests are allowed to *host* (probably not — hosting requires an
  account, since billing attaches to `profiles.id`).
- Keep entitlement checks server-side and always at point-of-action (room
  join, file upload) — never cache a "is premium" flag on the client as a
  source of truth.
- File uploads go through Supabase Storage (see STRUCTURE.md) using the
  service role key server-side — the client never uploads directly with a
  public key for anything that needs the size-limit/entitlement check
  enforced first.
