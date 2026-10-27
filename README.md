# Trainer Timesheet

A work-hours log for remote workers and students, played like a Pokémon battle.

- **Clock in with one press of a Poké Ball.** The ball opens and your trainer comes out. Clocking out recalls them.
- **The Clock is your opponent.** Its HP drains over an 8-hour day, so it nudges you to stop, never to push on.
- **A new coach every day.** One Pokémon from the original 151 coaches everyone that day (no repeats until all 151 have had a turn). It stands behind you and talks in type-flavoured game text boxes: "ALEX, I choose you!" and "That's enough, ALEX."
- **Earn trainer XP.** Every live minute is 1 XP. Time added afterwards counts toward your hours, but not XP.
- **Timesheets.** Export 1 week, 2 weeks or a custom range (anchored on its first or last day) as CSV, or print it.
- **Coach Pokédex.** Search the 151 and see which coaches have trained you, and on which days.

**Live:** _Vercel URL goes here_ · **Course:** Design, Build, Ship (MPCS 51238), Assignment 4

## Stack

| Part | What |
|---|---|
| App | Next.js 16 (App Router, Cache Components) and Tailwind CSS 4 |
| Sign-in | Clerk (development keys) |
| Database | Supabase Postgres with row-level security, connected to Clerk through Supabase third-party auth |
| External API | [PokéAPI](https://pokeapi.co) (no key) |
| Tests | Vitest (unit) and Playwright with `@clerk/testing` (end-to-end) |
| Hosting | Vercel (Hobby) |

## Data model and row-level security

Two tables, and every row belongs to one Clerk user (`user_id` = the `sub` claim of the Clerk token).

```
profiles                      work_sessions
  user_id  PK (Clerk sub)       id            uuid PK
  trainer_name                  user_id       (Clerk sub)
  avatar   jsonb                source        'clock' | 'manual'
  timezone (null = browser's)   clock_in / clock_out        what the timesheet shows
  created_at                    recorded_in / recorded_out  set only by the database clock
                                xp_minutes    generated: overlap of the two windows
                                note          optional, ≤ 500 chars
```

- **RLS is on for both tables.** Each has select, insert, update and delete policies that only allow rows where `(select auth.jwt()) ->> 'sub' = user_id`. Signed-out visitors (the `anon` role) have no access at all. The `user_id` is filled in by the database from the token, never sent by the browser.
- **Live sessions use the database's clock.** A trigger sets clock-in and clock-out to Postgres `now()`, ignoring any time the browser sends. Editing a session can only lower its XP, never raise it.
- **No overlaps.** An exclusion constraint blocks two sessions of one user overlapping in time. The app checks first and tells you exactly which session it overlaps.
- Migrations are in [`supabase/migrations/`](supabase/migrations).

## Where the API is called, and why

**On the server** (`src/lib/pokeapi.ts`, marked `server-only`):

1. **Caching.** PokéAPI's fair-use policy asks every app to cache responses. With `"use cache"` and `cacheLife("max")`, one fetch serves every user.
2. **Smaller responses.** A `/pokemon` response is about 300 KB. The server keeps only the few fields the UI needs.
3. **One place for errors.** Timeouts (8 s), 5xx, broken JSON and 404 become two error types, so the UI can show "nothing found" or "API down".

The designed states are:

- **Loading:** skeletons.
- **Nothing found:** in the Pokédex, `No Pokémon named "pikahcu"`, with "Did you mean Pikachu?".
- **API down:** a friendly message with **Try again**.

Clocking in never depends on PokéAPI.

## Run it locally

1. `npm install`
2. Create `.env.local` with these variables (names only; get the values from each dashboard):

   | Variable | From | Public? |
   |---|---|---|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API keys | yes |
   | `CLERK_SECRET_KEY` | Clerk → API keys | **no** |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | yes |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API Keys (`sb_publishable_…`) | yes |
   | `E2E_USER1_EMAIL`, `E2E_USER2_EMAIL` | two Clerk test users (end-to-end test only) | **no** |

   Never use the Supabase secret or service-role key: it bypasses RLS. `.env*` files are gitignored, and `.claude/settings.json` denies the coding agent from reading them.
3. `npm run dev`, then open http://localhost:3000.

## Tests

- `npm run test:unit`: 93 Vitest tests covering time zones and DST, ranges, the timesheet and CSV, XP, the daily coach, coach lines, the PokéAPI helper and the Pokédex search.
- `npm run test:e2e`: one Playwright test, **two users can't see each other's sessions** ([`e2e/rls.spec.ts`](e2e/rls.spec.ts)). Users A and B each add a session with a secret note on the same day; each must see their own note and not the other's.
  - **Watched failing first.** With the read policy changed to `using (true)`, user B's save was refused with "That overlaps your manual entry … 10:00", which was **user A's** session: B's queries could read A's rows ([`docs/test-runs/rls-broken-FAILED.txt`](docs/test-runs/rls-broken-FAILED.txt)).
  - **Then passing** after restoring the policy ([`docs/test-runs/rls-fixed-PASSED.txt`](docs/test-runs/rls-fixed-PASSED.txt)).

## Security review

`/security-review` was run on the `feature/clerk-auth` branch before merging.

- **No high- or medium-severity findings.**
- **Fixed:** CSV formula injection. Notes starting with `= + - @` are now prefixed with `'` so spreadsheets don't run them.
- **Left as is, on purpose:** Clerk warns that `createRouteMatcher` in `src/proxy.ts` is deprecated. That's not a vulnerability: every page and server action also checks `auth()` itself, and RLS enforces ownership in the database. The proxy is an extra layer.

## Design

The theme is "Dusk", a spinoff of my Neon Arcade design system, in Pokémon Diamond/Pearl colours, with dark tall grass and neon glow. Watch red is the only accent, and only the Poké Ball uses it. The process pages are still in the app:

- `/design/mood-board`
- `/design/system`
- `/design/fonts` and `/design/clock-fonts` (font comparisons)
- `/design/landing` (three front-page options)
- `/design/dashboard` (dashboard preview with sample data)

Pokémon data and sprites come from [PokéAPI](https://pokeapi.co). Pokémon and Pokémon character names are trademarks of Nintendo. This is a fan project for a class, not affiliated with Nintendo.
