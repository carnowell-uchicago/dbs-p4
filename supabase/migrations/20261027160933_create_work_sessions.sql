-- Lets the no-overlap rule compare a text column (user_id) with = inside a GiST index.
create extension if not exists btree_gist with schema extensions;

create table public.work_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null default (auth.jwt() ->> 'sub'),
  source       text not null default 'clock' check (source in ('clock', 'manual')),
  clock_in     timestamptz not null,
  clock_out    timestamptz,                -- null while a live session is running
  recorded_in  timestamptz,                -- set only by the trigger (database clock); null for manual
  recorded_out timestamptz,                -- set only by the trigger (database clock); null for manual
  note         text check (note is null or char_length(note) <= 500),
  created_at   timestamptz not null default now(),

  -- XP: whole minutes where the timesheet times overlap what the database clock recorded.
  -- Shrinking a session lowers it; stretching adds hours but no XP; manual entries earn 0.
  xp_minutes   integer generated always as (
    case
      when source = 'clock' and clock_out is not null and recorded_out is not null then
        greatest(0, floor(extract(epoch from (
          least(clock_out, recorded_out) - greatest(clock_in, recorded_in)
        )) / 60))::integer
      else 0
    end
  ) stored,

  constraint clock_out_after_clock_in check (clock_out is null or clock_out > clock_in),
  constraint manual_entries_are_finished check (source = 'clock' or clock_out is not null),

  -- No two sessions of one user may overlap. A running session counts until 'infinity'.
  constraint no_overlapping_sessions exclude using gist (
    user_id with =,
    tstzrange(clock_in, coalesce(clock_out, 'infinity'::timestamptz), '[)') with &&
  )
);

-- At most one running session per user ("you're already clocked in").
create unique index one_running_session_per_user
  on public.work_sessions (user_id) where clock_out is null;

-- Fast "my sessions, newest first" for the dashboard and log.
create index work_sessions_user_clock_in on public.work_sessions (user_id, clock_in desc);

alter table public.work_sessions enable row level security;

revoke all on table public.work_sessions from anon;
grant select, insert, update, delete on table public.work_sessions to authenticated;

create policy "Users can read their own sessions"
  on public.work_sessions for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own sessions"
  on public.work_sessions for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own sessions"
  on public.work_sessions for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own sessions"
  on public.work_sessions for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
