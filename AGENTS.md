<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md: Assignment 4, Full Stack App

**Course:** Design, Build, Ship (MPCS 51238), Autumn 2026
**Due:** Tuesday, October 27, 2026, 5:30 PM
**Source of truth:** `Assignment 4.pdf` in this folder. If this file and the PDF ever disagree, the PDF wins. Tell the student about the conflict.

This is the project's only context file. Do not create a `CLAUDE.md`. If one shows up, move anything useful from it into this file, delete it, and remind the student to run `/context` to confirm that `AGENTS.md` loaded.

---

## 0. Read this first: how you must work

This is graded coursework, and **the student is the one being graded**. The brief says:

> A one-shot submission, made by giving this brief to an agent once and turning in the result, is marked incomplete.

The student also has to explain everything in class: request tracing, access control, where API calls happen, testing, and how they directed you. So your job is to **build with the student, step by step, and teach them as you go**. You are not here to build the app on your own.

### Hard rules

1. **Work one step at a time** (Section 4). Do not jump ahead or batch several steps together. At the end of each step, stop and:
   - summarize what you did, and list every file you changed,
   - give the step's **Ask Your Agent** explanation, diagram, or quiz (Section 4), *or* offer it if the student would rather ask in their own words,
   - wait for the student to confirm before you start the next step.
2. **The student makes the design decisions.** That includes which tool, which API, the data model, where the API call happens, and the UI and UX. Offer options and trade-offs, give a recommendation, and then let them choose. Never pick the app idea for them. Push them away from generic ideas ("explore possibilities, so you don't end up making the same Pokémon app as your classmate").
3. **Never read, write, print, or ask the student to paste secrets.** Don't open `.env`, `.env.local`, or any `.env.*` file, and don't try to get around the deny rule (no `cat`, `grep`, `source`, `printenv`, `echo $SECRET`, and so on). When you need a key, tell the student the **variable name** and where to find the value. The student puts it in `.env.local` themselves.
4. **Never hard-code keys** in source, tests, docs, commit messages, or config that gets committed. Read them only through `process.env.*`. Before every commit, check that no secret is staged.
5. **Only the student does the things marked STUDENT** (Section 3). Don't fake them, simulate them, or claim they happened. If a task needs a dashboard, a login, or a judgment call, give the student clear instructions and wait.
6. **Commit often, and push.** The git history is graded, so it has to show real progress. Commit after every meaningful unit of work (a working feature, a migration, a fix, a test, a docs update), not one big commit per step. Use clear messages that say what changed and why. After committing, `git push` to `origin` (https://github.com/carnowell-uchicago/dbs-p4). You don't need to ask before routine commits and pushes, but tell the student what you committed. Before every commit, run `git status` and check the staged files: no `.env*` files (other than `.env.example`), no secrets, nothing that shouldn't be public. Never force-push, rewrite history, or commit directly to `main` after the initial setup commit. Do feature work on a branch (see Step 8), and leave merging to the student.
7. **Stay on free tiers.** Don't add paid services, paid plans, or anything that needs a payment method. Stay on Clerk **development** keys.
8. **Be honest.** If a test fails, a deploy breaks, or you aren't sure something works, say so plainly and show the output. Never weaken a test or turn off RLS just to make something pass.
9. **Explain as you build.** Keep the code readable and simple enough for the student to defend line by line. Don't over-engineer.

---

## Status and next steps (updated 2026-10-27; read this first in a new session)

**Due today, Tuesday Oct 27, 5:30 PM.** Work is on branch `feature/clerk-auth`, pushed to `origin` after every commit. `main` has only the initial setup commit. Plain `git push` works.

**Done so far:**
- **Step 1:** idea and API chosen (Section 2).
- **Step 3:** deny rule in `.claude/settings.json`; `.env*` is gitignored.
- **Step 4 (partly):** `clerk init` ran with app `app_3Kyu70z56nAtnZonNsGQNtTOLgn` ("p4", development keys in `.env.local`). Header Sign in / Sign up / UserButton added. The student signed up. **Not done:**
  - `src/proxy.ts` is bare `clerkMiddleware()`, so it protects nothing yet. Add `createRouteMatcher` protection for the app's data routes when they exist.
  - The student still has to check those routes signed out.
  - The Step 4 "Ask Your Agent" (explain what `clerk init` added, file by file) was postponed by the student until those routes are protected.
- **Design:** mood board, Dusk design system, font comparison, and the UI library in `src/components/ds/`:
  - ClockButton (Poké Ball), WatchTimer, TrainerAvatar, TrainerCard, XpBar, CoachCard, TextBox
  - Segmented, Field, SwatchPicker, Tag/Badge, Skeleton, Button
- **Logic in `src/lib/` with Vitest tests** (`npm run test:unit`, 72 passing; run `npx next typegen` before `npx tsc --noEmit` on a fresh clone):
  - `time.ts`, `dates.ts`, `ranges.ts`, `timesheet.ts` (CSV)
  - `xp.ts`, `daily-pokemon.ts`, `coach-lines.ts`
  - `pokeapi.ts`
- **Step 5 done 2026-10-27:** 4 migrations applied via MCP and saved in `supabase/migrations/`. RLS on both tables (4 own-rows policies each), anon has no grants, security advisor clean; verified with simulated users in rolled-back transactions. Clerk ↔ Supabase integration + env vars done by the student and verified end to end (signed in: token role `authenticated`, query OK; signed out: `42501 permission denied`). Clients: `src/lib/supabase/server.ts` (`createServerSupabase()`), `client.ts` (`useSupabase()` hook), types in `database.types.ts` (regenerate via MCP after each migration).
- **Supabase (in progress, student):** project ref `dxwqwpbtuizagvkawlhl`. `.mcp.json` is committed and scoped to it. The agent fixed a line break that had split the ref.

**Waiting on the student:**
1. **Supabase setup:**
   - Restart Claude Code, run `/mcp`, and log in to **supabase**. Check that its tools load before doing any database work.
   - Clerk Dashboard → Supabase integration → Activate, then copy the Clerk domain into Supabase → Authentication → Sign In / Providers → Third-Party Auth → Clerk.
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
2. **Approve the data model** (Section 2). Ask whether they want tags or notes on sessions.
3. **Confirm assumptions:**
   - the coach changes at midnight `America/Chicago` (`DAILY_EPOCH` 2026-10-27);
   - XP curve: 1 XP per minute, level n→n+1 costs 100·n;
   - the coach's tone: the 8 h lines suggest winding down; check a few in `coach-lines.ts`;
   - server-side PokéAPI (Step 6).

**Next for the agent, in order** (one step at a time, stop after each per Section 0):
- **Step 5:** migrations through the Supabase MCP, RLS on both tables, run the security advisors.
  - Supabase client using Clerk's token: `accessToken: async () => (await auth()).getToken()` on the server, or `session?.getToken()` on the client.
  - Then the "Ask Your Agent" RLS explanation.
- **App screens (Dusk components):**
  - Dashboard: today's coach + text box, the Poké Ball clock button + watch timer, trainer card with level/XP, today's sessions.
  - Profile / avatar editor.
  - Log page: 1w / 2w / custom with a start-or-end anchor, a table, CSV download.
  - Use the tall-grass background on app pages. Restyle the global header in `src/app/layout.tsx`, which is still the default white.
  - **Remote images:** add `raw.githubusercontent.com` to `next.config.ts` `images.remotePatterns`, or use `unoptimized`.
  - **States:** loading, empty and API-down for the coach. Clocking in must never depend on PokéAPI.
- **Step 4 finish:** protect the routes in `proxy.ts`; the student checks them signed out.
- **Step 7:**
  - One Playwright test with `@clerk/testing`: two users each save something, and neither can see the other's. The student creates the test users and their env vars.
  - **The student breaks RLS and watches it fail**, then it's fixed and passes. Save the failing output.
  - Chromium is already installed in `~/Library/Caches/ms-playwright`.
- **Step 8:**
  - The student runs `/security-review` on the branch and reads the diffs; findings get handled.
  - The student merges, deploys on Vercel (Hobby) with env vars set, and has a classmate use it.
  - Write `README.md` (it's still the create-next-app default).
- Fill in the Vercel URL in Section 2 and keep the **Agentic workflow log** (Section 6) current.

**Dev notes:**
- `npm run dev` serves on :3000.
- Next 16 has `cacheComponents: true`, so anything that reads auth or request data must sit inside `<Suspense>`, or the build fails. That's why the layout's auth controls and the sign-in/up pages are wrapped.
- Screenshots and Playwright scratch scripts go in the session scratchpad, not the repo.
- Stage explicit paths when committing; `.claude/worktrees/` is ignored.

---

## 1. Requirements checklist (all are graded)

- [ ] **Accounts:** sign up, sign in, and sign out with Clerk. A signed-out visitor sees no one's data.
- [ ] **Data:** stored in Supabase, with row-level security (RLS) on **every** table, so each person sees only their own rows.
- [ ] **API:** data from one external API, with designed states for **loading**, **nothing found**, and **API down/unavailable**.
- [ ] **Persistence:** saved data is still there after signing out and back in, on another device.
- [ ] **Keys:** kept in environment variables, never in the code or the repo, with a deny rule for `.env` files in `.claude/settings.json`.
- [ ] **Test:** one Playwright E2E test showing that two users can't see each other's data. The student must **watch it fail before it passes**.
- [ ] **Review:** `/security-review` run on a branch, and its findings handled.
- [ ] **Deployed:** live on Vercel (free Hobby plan), where a classmate can make an account and use the app.
- [ ] **UI/UX:** follows the course's design process and UI/UX principles and flows.
- [ ] **GitHub repo:** the student's own repo, with a `README.md` and a commit history that shows progress.
- [ ] **Student can explain the work in class** (Section 6).

**Tech stack (required):** Next.js (App Router) + Tailwind CSS, Clerk, Supabase, one external API, GitHub, and Vercel Hobby.

---

## 2. Project facts (fill in with the student as you go)

> Leave these blank until the student decides. Update this section as soon as a decision is made.

- **Tool / app idea (chosen 2026-10-27):** a **remote-work hours log**, mainly for people who need to keep their own record of hours (it also works for study hours), themed as a Pokémon trainer being coached by a daily Pokémon.
  - **Clock in / clock out** must be fast and obvious: one primary action.
  - **The user is the trainer (reworked 2026-10-27).** Hours worked earn the **user** XP, and the user's **trainer level** goes up (`src/lib/xp.ts`; its curve now applies to the trainer). There is no "active Pokémon" to pick.
  - **Trainer avatar:** each user has a mock trainer avatar they **customize in their profile**. It's original SVG art built in code, not game sprites, and it's saved in Supabase with the profile.
  - **Daily Pokémon = today's coach:** each day's Pokémon "trains" the user for that day. It's the **same Pokémon for everyone that day**, drawn at random from the original Pokédex (**#1–151, confirmed by the student**), with **no repeats until all have been used**, then a new cycle. Logic: `src/lib/daily-pokemon.ts`.
  - **Coach dialogue:** the coach talks to the user in **game-style text boxes**. The lines depend on **what kind of Pokémon it is** (its type), and on what's happening (clock in, clock out, milestones, level-up).
  - **Timesheet export:** generate a log for **1 week**, **2 weeks**, or a **custom** range. The user picks **either the start or the end date**, and the other end is calculated.
- **Theme decision (2026-10-27): design the dusk direction (B) first.** Clock in is red, like the watch button and/or a Poké Ball. Pixel font must be a Google Font; the student chose **Silkscreen** after comparing ten on `/design/fonts` (Pixelify Sans made 5 and S look alike). Later the student found Silkscreen's **4 reads like a 9** on the clock, compared 11 fonts on `/design/clock-fonts`, and chose **Press Start 2P** for the watch digits only (`--dp-clock`); game text stays Silkscreen.
- **Background (2026-10-27):** the student asked for a dark tall-grass background instead of plain black: `src/components/ds/textures.ts` (pixel tile under a 45% navy wash; text still passes AA on the brightest blade).
- **Theme: "Dusk"**, a spinoff of **Neon Arcade** (the student's Assignment 2, `~/projects/p2`, tokens in `src/components/ds/neon-arcade/tokens.ts`) using Pokémon Diamond/Pearl colours. Mood board at `/design/mood-board` (daytime research; dusk was chosen afterwards), design system at `/design/system`, font comparison at `/design/fonts`. **The app UI must be built from `src/components/ds/`** (tokens in `tokens.ts`, background in `textures.ts`, fonts in `fonts.ts`); don't invent new colours. Watch red (`--dk-red`) is the only accent and only the Clock in/out control wears it. The student hasn't yet given a final OK on the design system; ask for feedback on anything new.
- **Extending Assignment 3, or starting new?** Starting a new project.
- **External API:** PokéAPI, `https://pokeapi.co/api/v2/`. No key needed. Read-only (GET). Endpoints used: `/pokemon/{id}`, `/pokemon-species/{id}`, `/pokemon?limit=151` (see `src/lib/pokeapi.ts`).
- **Sample response notes** (checked 2026-10-20):
  - `GET /pokemon/{name|id}` returns about 300 KB of JSON: `id`, `name`, `height` (decimetres), `weight` (hectograms), `types[]`, `abilities[]`, `stats[]` (hp/attack/defense/sp-atk/sp-def/speed), `sprites` (PNG URLs, including `other.official-artwork`), `cries` (`.ogg` URLs), `moves[]` (100+ entries), and `species` (a link to the `/pokemon-species` endpoint).
  - `GET /pokemon-species/{name|id}` returns `flavor_text_entries` (Pokédex text, many languages and versions; contains `\n` and `\f` that need cleaning), `genera`, `is_legendary`/`is_mythical`, `habitat`, `color`, `evolution_chain` (link), and `generation`.
  - `GET /pokemon?limit=N&offset=M` returns a paginated list of `{name, url}` (`count` is 1351).
  - **Nothing found:** an unknown name returns **HTTP 404** with `{"status":404,"message":"Not Found"}`. There is **no partial or fuzzy search**: `pika` returns 404. A search UI needs the full name list (fetched once and cached) to filter against. The name lookup accepted `Pikachu`, but lowercase input before sending it anyway.
  - Other resources: types, moves, abilities, items, berries, evolution chains, locations, regions, generations, natures, and Pokédexes.
  - **Images:** `sprites` holds URLs on `raw.githubusercontent.com/PokeAPI/sprites/…`. Use `front_default` (~0.6 KB pixel sprite, good for lists) or `other.official-artwork.front_default` (~118 KB, good for detail views). Store only the URL or the Pokémon ID, not the image. If you use `next/image`, add `raw.githubusercontent.com` to `images.remotePatterns`. Show the Nintendo trademark credit in the footer.
  - **PokéAPI fair use policy:** "Locally cache resources whenever you request them". Repeated calls get your IP permanently banned. Cache every PokéAPI response (the data almost never changes), and never call it in a loop without caching.
- **Where the API is called (browser vs. server) and why (decided by the student 2026-10-27): on the server.** Reasons in the student's words: "for the caching rule and smaller responses". PokéAPI's fair-use policy requires caching every response, and a server cache serves all users from one fetch. The server sends the browser only the few fields the coach needs instead of a ~300 KB response. Implemented in `src/lib/pokeapi.ts` (`import "server-only"`, `"use cache"` + `cacheLife("max")`, 8 s timeout, `PokemonNotFoundError` vs `PokeApiUnavailableError`). Known limit: the cache may reset when Vercel starts a fresh server instance; acceptable at this traffic.
- **GitHub repo URL:** https://github.com/carnowell-uchicago/dbs-p4 (remote `origin`)
- **Vercel URL:** https://dbs-p4.vercel.app (deployed by the student 2026-10-27; `feature/clerk-auth` merged via PR #1)

### Data model

> **Write this in Step 2 and get the student's approval before building anything that touches the database.** Keep it small (usually 2–3 tables). Every table that holds a person's data has a `user_id` column.

**Approved by the student on 2026-10-27.** Migrations are in `supabase/migrations/`.

```
profiles
  user_id       text primary key default (auth.jwt() ->> 'sub')   -- Clerk user ID
  trainer_name  text not null
  avatar        jsonb not null   -- { skin, hair, hairColor, hat, hatColor, outfit } (see TrainerAvatar.tsx)
  timezone      text             -- NULL = auto-detect from the browser; set = saved override (IANA zone)
  created_at    timestamptz not null default now()
work_sessions
  id            uuid primary key default gen_random_uuid()
  user_id       text not null default (auth.jwt() ->> 'sub')
  source        text not null default 'clock'   -- 'clock' (live Poké Ball) | 'manual' (added afterwards); can't change after insert
  clock_in      timestamptz not null   -- editable: what the timesheet shows
  clock_out     timestamptz            -- editable; null while running; check clock_out > clock_in
  recorded_in   timestamptz            -- set ONLY by trigger = DB now() at clock in; never editable; null for manual
  recorded_out  timestamptz            -- set ONLY by trigger = DB now() at clock out; never editable; null for manual
  xp_minutes    integer GENERATED      -- minutes of overlap between [clock_in, clock_out] and [recorded_in, recorded_out]; 0 for manual
  note          text                   -- optional "what I worked on"; check length <= 500
  created_at    timestamptz not null default now()
  + check: source = 'manual' requires clock_out (a manual entry is always finished)
  + unique partial index: one running session per user (where clock_out is null)
  + exclusion constraint: no two sessions of one user may overlap in time (a running session counts as
    running until 'infinity'). The app checks first and tells the user exactly which session it overlaps;
    the constraint is the backstop for races and hand-crafted requests
  + trigger (before insert/update): clock sessions get clock_in = recorded_in = now() on insert and
    clock_out = recorded_out = now() when stopped; source and recorded_* can never be changed by the client
RLS: enabled on both; select/insert/update/delete only where user_id = (auth.jwt() ->> 'sub')
```

Student requests (2026-10-27):
- An optional **note** per session (some people have to log what they spent time on).
- **Manual / retroactive entries** count toward hours and the timesheet CSV, but **earn no trainer XP**, to encourage logging live every day.
- **Timezone:** auto-detect from the browser by default; a saved profile setting overrides it.
- **No faked sessions:** live sessions are timed by the **database's own clock** (`now()` in a trigger), not by times the browser sends.
- **No overlaps:** a manual entry or edit that overlaps logged time is rejected, and the user is told exactly which session it overlaps. Manual entries can't end in the future.
- **Edits can only reduce XP, never increase it:** XP = the overlap of the edited times with the DB-recorded window, so shrinking a session lowers XP and stretching it adds hours but no XP. Deleting removes its XP.

Not stored, calculated: trainer level (from the sum of `xp_minutes`, curve in `src/lib/xp.ts`), the daily coach (from the date, `src/lib/daily-pokemon.ts`), and which coach trained you on each logged day.

Template for any other table:

```
table_name
  id          uuid primary key default gen_random_uuid()
  user_id     text not null default (auth.jwt() ->> 'sub')   -- Clerk user ID
  ...columns...
  created_at  timestamptz not null default now()
RLS: enabled
Policies: select/insert/update/delete only where user_id = (auth.jwt() ->> 'sub')
```

### Environment variables (names only, never values)

| Name | Public? | Where it's used |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | yes (publishable) | browser + server |
| `CLERK_SECRET_KEY` | **no, server only** | server |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | browser + server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`, from Project Settings → API Keys) | yes (publishable) | browser + server |
| Playwright test users: `E2E_USER1_EMAIL`, `E2E_USER2_EMAIL` (passwords not needed: the test signs in with a Clerk sign-in ticket made with `CLERK_SECRET_KEY`, because password sign-in from a new browser stops at Clerk's `needs_client_trust` email code) | **no** | tests only |
| External API key (only if the chosen API needs one) | **no, server only** | server |

Never use the Supabase **secret / service_role** key in the app. It bypasses RLS.

---

## 3. Who does what

### STUDENT only (the agent must not do or fake these)

- Choose the tool, the API, and the design direction. Approve the data model.
- Create `.claude/settings.json` with the deny rule (or approve it if the agent drafts it), **before any key exists**:
  ```json
  { "permissions": { "deny": ["Read(./.env)", "Read(./.env.*)"] } }
  ```
- Create `.env.local` and paste every key into it. The agent can't read or write this file.
- Create accounts, projects, and settings in dashboards: Clerk app, Supabase project, Clerk ↔ Supabase third-party auth (Supabase: Authentication → Sign In / Providers → Clerk, plus the matching Supabase integration setting in Clerk), Clerk test users, GitHub repo, Vercel project, and **Vercel environment variables**.
- Connect the Supabase MCP server to the agent, **scoped to this one project** (`project_ref=...`). Writing is recommended for this project; `&read_only=true` is optional.
- Check signed-out access in a browser themselves.
- **Break RLS on purpose and watch the Playwright test fail**, then fix it and watch it pass. The agent can prepare the commands, but the student runs them or explicitly directs each one, and must see the failure with their own eyes.
- Run `/security-review` (a slash command the student types) on the branch before merging, and **read the agent's diffs**.
- Decide which security-review findings to fix and how.
- Merge the branch.
- Have a classmate create an account and use the deployed app.
- Set usage limits and spending alerts on every service. Never add a payment method without a spending cap.
- Run `/context` to confirm that `AGENTS.md` loaded.
- Submit the Vercel URL and GitHub URL in Google Classroom.
- Explain the work in class.

### AGENT (with the student watching and approving)

- Call the chosen API and show one real response, plus one empty or no-results response.
- Scaffold the Next.js + Tailwind app. Run `npx -y clerk@latest init` (the student may want to run it themselves; ask first).
- Write the migrations and RLS policies through the Supabase MCP server, and explain each one.
- Write the app code: auth-gated pages, Supabase client wired to the Clerk token, API integration, and the loading/empty/error states.
- Write the Playwright test and its config.
- Draft the `README.md`.
- Give the explanations, diagrams, and quizzes for each step.
- Help troubleshoot the Vercel deploy. Give the student the list of env var **names** to set in Vercel.

---

## 4. Steps (one at a time, stop after each)

### Step 1: Choose the tool and the API
- Ask whether the student is extending Assignment 3 (if so, have them bring the code into this folder) or starting something new.
- Help them brainstorm ideas that go beyond the obvious. Suggested keyless APIs: Open-Meteo, Open Library, iTunes Search, Divvy, Chicago Data Portal, Art Institute of Chicago, TheMealDB, PokéAPI. Others are fine too.
- The tool should let someone **search or browse** API data, **save what they like**, and **come back to it**.
- Once they choose, **call the API for real** (e.g. `curl`) and show one real response. Then show what happens when a search finds nothing, and what an error looks like.
- Record the decisions in Section 2.
- **Ask Your Agent:** "Explain this response: what each field means, and which ones my tool needs."

### Step 2: Plan the data with the student
- Discuss what gets saved and who it belongs to. Keep it to 2–3 tables, each with a `user_id`. Store only the API fields the UI needs (e.g. the external ID, title, image URL), plus any user-specific fields such as notes, ratings, or tags.
- Write the data model in Section 2 of this file. **Have the student read and approve it** before building anything.
- **Ask Your Agent:** "Draw a diagram of my tables: what each one holds, and how each row belongs to one person." (Use an ASCII or Mermaid diagram.)

### Step 3: Protect the keys
- Make sure `.claude/settings.json` has the deny rule **before** any key is created. Make sure `.gitignore` covers `.env*` (allow `.env.example` if you add one, with names only).
- The student creates `.env.local`. Don't touch it.
- **Ask Your Agent:** "Explain why this deny rule protects my keys. Then explain the difference between my publishable and secret keys, and where each one is allowed to go."

### Step 4: Add sign-in with Clerk
- Run `npx -y clerk@latest init`. Make sure sign-up, sign-in, and sign-out all work, and that the route protection (middleware/proxy) keeps signed-out visitors away from every data page and data-returning server route.
- The **student checks it signed out** in a browser (e.g. a private window), including visiting data URLs directly.
- **Ask Your Agent:** "Show me how the Clerk CLI works: what `clerk init` added to my project, file by file."

### Step 5: Add Supabase and connect it to Clerk
- The student creates the Supabase project, connects the MCP server (scoped to the project), and enables Clerk as a third-party auth provider.
- Create the tables **as migrations** through the MCP server. **Enable RLS on every table**, and add policies keyed to `auth.jwt() ->> 'sub'`. Afterwards, run the MCP security advisors and confirm that RLS is on everywhere.
- Create the Supabase client with Clerk's session token (`accessToken: async () => session?.getToken()` on the client, or `auth().getToken()` on the server). Don't use the deprecated JWT-template approach unless the student asks for it.
- Never use the service_role/secret key in the app.
- **Ask Your Agent:** "Explain each row-level security policy in plain words, then show me a query that one of them would block."

### Step 6: Decide where to call the API
- Lay out the trade-offs (keys, rate limits, caching, CORS, or none of those) and let the student decide between browser and server (route handler / server action). Record the decision and the reason in Section 2.
- Build the designed states: **loading** (skeleton or spinner), **nothing found** (a helpful message with a next step), and **API down** (a friendly error with retry; it must not crash). Help the student test the API-down state, e.g. by temporarily pointing at a bad URL or simulating a failure.
- Apply the course's UI/UX principles: clear flows, feedback, empty states, accessible contrast and labels, and a responsive layout.
- **Ask Your Agent:** "Draw a diagram of one request, from the click to the screen: the browser, my server, Clerk, Supabase, and the API."

### Step 7: Test it, and watch the test fail first
- Write **one** Playwright E2E test: user A and user B each sign in and save something, and neither can see the other's item. Use `@clerk/testing` (`clerkSetup` and testing tokens) so sign-in works in tests. Test-user credentials come from env vars that the **student** sets. Never hard-code them.
- The **student breaks RLS on purpose** (e.g. a temporary migration that replaces the select policy with `using (true)`, or disables RLS), runs the test, and **watches it fail**. Save the failing output for the student; they'll be asked about it in class. Then restore the correct policy, rerun, and watch it pass.
- Make sure the "broken RLS" change is fully reverted and RLS is verified as on before moving on.
- **Ask Your Agent:** "Explain why the test failed when I broke row-level security, in one sentence I could say in class."

### Step 8: Review and deploy
- All the work above should be on a feature branch (e.g. `feature/full-stack`). Before merging, the **student runs `/security-review`** and reads your diffs. Fix the findings the student wants fixed, and note any that are intentionally left alone, with the reason.
- Once the branch is pushed and merged, the student creates the Vercel project (Hobby) from the GitHub repo, and sets the env vars in Vercel. Give them the list of **names**. Remind them to add the Vercel domain wherever Clerk or Supabase need it.
- Check the live site together. Then the **student has a classmate** sign up and use it. Check persistence: sign out, sign back in on another device, and the data should still be there.
- Make sure `README.md` covers what the app does, the API used, the stack, the data model and RLS summary, how to run it locally (env var names only), how to run the test, and the live URL.
- **Ask Your Agent:** "Quiz me on how my app works, one question at a time, and tell me what I got wrong. Start with the questions in Be Ready to Explain." (Ask one question, wait for the answer, give feedback, then ask the next.)

### Free tiers and limits
- **Ask Your Agent:** "Walk me through the free tier limits for each service my app uses, and how to set usage limits and spending alerts for each one."
- Remind the student that Supabase pauses free projects after about a week of inactivity, so they should open the app now and then until grades are back.

---

## 5. Technical guardrails

- Every data page and every server route or action that reads or writes user data must check auth (Clerk `auth()`), *and* RLS must enforce ownership in the database. Never rely on hiding things in the UI.
- Never trust a `user_id` sent from the client. Let the database default (`auth.jwt() ->> 'sub'`) or the server set it.
- Validate and encode user input that goes into API URLs (`encodeURIComponent`).
- Handle non-200 responses, timeouts, and malformed JSON from the external API.
- Use Next.js and Clerk versions that are current and compatible with each other. Follow the docs for the version installed (check `node_modules` and the official docs rather than relying on memory).
- Don't add libraries the app doesn't need.

---

## 6. Be Ready to Explain (the student is quizzed on these in class)

1. **Tracing requests:** someone saves an item. What happens in the browser, on the server, in Clerk, in Supabase, and at the API?
2. **How you control access:** where does the app know who someone is, and where does it decide what they may see?
3. **Where API calls happen:** where the app calls the API, and why there.
4. **Testing:** what did the test look like when it failed, and what changed?
5. **Agentic workflow:** what did the student stop the agent from doing, and what did they catch when reading its changes?

To help with #5, keep a short running log below. Record each time the student redirects, stops, or corrects you, and anything they caught in review. Be honest.

### Agentic workflow log
- _(add entries as they happen: date, what the student stopped or caught, what changed)_
- 2026-10-20: The student chose to do Step 4 (Clerk) before Steps 1–3. The agent pointed out that `clerk init` would scaffold into a subfolder of a "bare" directory, so the Next.js app was created at the repo root first. The student picked Clerk app `app_3Kyu70z56nAtnZonNsGQNtTOLgn` in the Clerk Dashboard. Steps 1–3 (idea, API, data model) still need to be done before any Supabase work.
- 2026-10-27: The student asked for **more real gameplay images** on the mood board. Bulbagarden blocks automated downloads; the agent did not try to get around that and used Wikipedia/Commons instead (4 more references).
- 2026-10-27: The student asked the agent to **use subagents for background work** while the design is still open. The agent kept decision-dependent work (data model, database, UI) out of it and launched two worktree agents: pure time/XP/daily-Pokémon logic with tests, and a cached server-side PokéAPI module.
- 2026-10-27: Agent mistake, caught by the agent and fixed: a `git add -A` picked up the agents' `.claude/worktrees/` folders (gitlinks only, no file contents). Fixed forward in a new commit (no history rewrite), and the folder is now in `.gitignore`. **Lesson: stage explicit paths while worktrees exist.**
- 2026-10-27: The student **reworked the core idea** mid-build: the user is the trainer who earns XP, with a customizable avatar, and the daily Pokémon is a coach that talks in type-based text boxes. This replaced the agent-built "active Pokémon earns XP" plan.
- 2026-10-27: The student chose the **dusk** direction and a **red Poké Ball** Clock in button. They then rejected the pixel font the agent had picked (Pixelify Sans) as hard to read. The agent built a 10-font comparison, found that Pixelify and Tiny5 make 5 and S look alike ("7.5" reads as "7.S"), and the student picked **Silkscreen**.
- 2026-10-27: The student asked for a **tall-grass background** instead of plain dark. The agent's first tile had a bug (all four quadrants were identical, so there was no offset), which the agent caught and fixed. It also checked text contrast against the brightest blade.
- 2026-10-27: The student set up the Supabase MCP. The agent caught a **line break splitting the project ref** in `.mcp.json`, which would have stopped it connecting, and fixed it.
- 2026-10-27: The student logged in to the Supabase MCP (the agent confirmed it reaches project `dxwqwpbtuizagvkawlhl`, empty `public` schema). Reviewing the data model, the student **added two features**: optional session notes, and manual/retroactive time entries that deliberately **earn no XP**, to encourage logging live.
- 2026-10-27: The student chose: timezone auto-detected with a saved override; live sessions timed by the **database clock** (trigger + `now()`); edits may only ever **reduce** XP; overlapping entries rejected with a message naming the conflicting session. Agent test mistake: its first overlap test used a "running" session that started at the same `now()` as the transaction, so it falsely looked like a bug; the agent re-ran it with a backdated session and it passed.
- 2026-10-27: The student chose the **Coach Pokédex** page for search/"nothing found" and the **two-column** dashboard (agent stacks the clock first on phones). Then the student asked for: a reworked front page (agent built 3 directions on `/design/landing` to choose from), a **Poké Ball release/recall animation** with the avatar coming out onto a shadow spot, and **anime-style lines** ("{trainer}, I choose you!" / "That's enough, {trainer}."). A worktree subagent wrote the 102 lines; the agent reviewed and cherry-picked them. The agent also made the clock-in line win for 10 minutes so it shows even late in the day, and toned down an over-promising privacy line ("even we can't peek") to what RLS actually guarantees.
- 2026-10-27: The student picked front page **B**, asked for signed-in users to skip the front page (proxy redirect to `/dashboard`), and rejected the dashboard design (unbalanced, too many boxes, not game-like). They chose a battle scene, then **corrected the agent's layout mid-build**: the agent had the coach as the opponent; the student said the coach belongs on *your* side, behind you where the trainer stands, and the **Clock is the opponent**. The agent rebuilt it that way (coach back sprite, Clock HP drains over an 8 h day).
- 2026-10-27: The student asked for a timesheet button (the agent built `/log` with print + CSV), more neon glow, a player HP bar fixed at 100/100, roomier coach label (the agent found `sm:not-sr-only` was zeroing its padding), and flagged the clock's 4 looking like a 9 (font comparison, student picked Press Start 2P). The agent also found the dev server serving stale CSS and restarted it.
- 2026-10-27: Testing the API-down state, the student caught an **invisible Try again button** (white on the white text box). On the Pokédex they caught that **"Coached me" didn't filter** until Search was pressed; it now applies on click. The student also asked the agent to re-read the PDF to confirm the two-user Playwright test is required (it is: Step 7 and Requirements).
- 2026-10-27: Playwright test written (`e2e/rls.spec.ts`, `npm run test:e2e`). First runs failed on setup, not RLS: a wrong test-user password (student fixed it), then Clerk's `needs_client_trust` new-device check (agent diagnosed it from the sign-in status and switched to ticket sign-in by email). Then it passed with RLS intact.
- 2026-10-27: **Step 7 done.** The student broke RLS in the Supabase SQL editor (read policy on `work_sessions` → `USING (true)`); the test **failed**: user B's save was refused with "That overlaps your manual entry … 10:00", which was user A's session (`docs/test-runs/rls-broken-FAILED.txt`). The student restored the policy; the agent verified all 8 policies and RLS in the database, the test **passed** (`docs/test-runs/rls-fixed-PASSED.txt`), and the security advisor reported no issues.
- 2026-10-27: The student ran `/security-review` (the agent first set `origin/HEAD` so it could diff against `main`): no high/medium findings. The student chose to **fix** the low CSV formula-injection note (now prefixed with `'`) and leave the Clerk `createRouteMatcher` deprecation with a reason (pages and actions also check `auth()`, RLS enforces ownership). README written.
- 2026-10-27: **Deployed** by the student at https://dbs-p4.vercel.app after merging PR #1. The agent verified signed-out visits to /dashboard, /log, /pokedex land on sign-in (curl got Clerk's 404 for non-browser requests; a real browser is redirected), and ran the two-user RLS test against the live site: passed.
- 2026-10-27: The student asked for a trainer page (name + avatar), today's coach card on the dashboard (then redirected: left of a narrower battle scene), caught the **phone header causing sideways scroll**, and asked for **double-resolution, more Pokémon-trainer-like avatars** (now 32×48, Diamond/Pearl style). Agent slips, fixed: `npx prettier` downloaded Prettier and reformatted the whole dashboard page (reverted, edits redone by hand); a shell `${…}` expansion blanked one line of the avatar file (fixed); the first new avatars had eyes merging into the hairline (moved down a row). Signed-in pages were checked with the Playwright test user, not the student's account.
- 2026-10-27: Agent slip: moving `fonts.ts` left the new copy staged, so it landed in an unrelated commit ("Rework the idea…"). The next commit removed the old copy; history was left as is.

---

## 7. Submission (student does this)

Submit in Google Classroom:
1. **Vercel URL:** the live link.
2. **GitHub URL:** the repository, with `README.md` and a commit history that shows progress.
