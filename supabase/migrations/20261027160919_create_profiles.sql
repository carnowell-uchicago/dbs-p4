-- One profile per Clerk user. user_id comes from the signed Clerk token, never from the browser.
create table public.profiles (
  user_id      text primary key default (auth.jwt() ->> 'sub'),
  trainer_name text not null check (char_length(trainer_name) between 1 and 40),
  avatar       jsonb not null check (jsonb_typeof(avatar) = 'object'),
  timezone     text check (timezone is null or char_length(timezone) between 1 and 64), -- null = use the browser's zone
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select, insert, update, delete on table public.profiles to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id)
  with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "Users can delete their own profile"
  on public.profiles for delete to authenticated
  using ((select auth.jwt() ->> 'sub') = user_id);
