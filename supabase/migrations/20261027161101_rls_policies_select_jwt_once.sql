-- Same rules, rewritten as (select auth.jwt()) ->> 'sub' so the performance advisor
-- recognises that the token is read once per query, not once per row.
alter policy "Users can read their own profile"   on public.profiles using ((select auth.jwt()) ->> 'sub' = user_id);
alter policy "Users can create their own profile" on public.profiles with check ((select auth.jwt()) ->> 'sub' = user_id);
alter policy "Users can update their own profile" on public.profiles using ((select auth.jwt()) ->> 'sub' = user_id) with check ((select auth.jwt()) ->> 'sub' = user_id);
alter policy "Users can delete their own profile" on public.profiles using ((select auth.jwt()) ->> 'sub' = user_id);

alter policy "Users can read their own sessions"   on public.work_sessions using ((select auth.jwt()) ->> 'sub' = user_id);
alter policy "Users can create their own sessions" on public.work_sessions with check ((select auth.jwt()) ->> 'sub' = user_id);
alter policy "Users can update their own sessions" on public.work_sessions using ((select auth.jwt()) ->> 'sub' = user_id) with check ((select auth.jwt()) ->> 'sub' = user_id);
alter policy "Users can delete their own sessions" on public.work_sessions using ((select auth.jwt()) ->> 'sub' = user_id);
