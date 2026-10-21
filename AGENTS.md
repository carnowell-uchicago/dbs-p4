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

- **Tool / app idea:** _TBD (student decides in Step 1)_
- **Extending Assignment 3, or starting new?** _TBD_
- **External API:** _TBD_ (base URL, endpoints used, whether a key is needed)
- **Sample response notes:** _TBD (fields we use; what an empty result looks like; error behavior)_
- **Where the API is called (browser vs. server) and why:** _TBD (Step 6)_
- **GitHub repo URL:** https://github.com/carnowell-uchicago/dbs-p4 (remote `origin`)
- **Vercel URL:** _TBD_

### Data model

> **Write this in Step 2 and get the student's approval before building anything that touches the database.** Keep it small (usually 2–3 tables). Every table that holds a person's data has a `user_id` column.

_TBD. Use this format for each table:_

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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `..._ANON_KEY`) | yes (publishable) | browser + server |
| Playwright test-user credentials (e.g. `E2E_USER1_EMAIL`, `E2E_USER1_PASSWORD`, `E2E_USER2_...`) | **no** | tests only |
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

---

## 7. Submission (student does this)

Submit in Google Classroom:
1. **Vercel URL:** the live link.
2. **GitHub URL:** the repository, with `README.md` and a commit history that shows progress.
