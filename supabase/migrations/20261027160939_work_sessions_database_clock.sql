-- Live sessions are timed by the database's clock, not by times the browser sends.
create or replace function public.work_sessions_database_clock()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.source = 'clock' then
      -- Clocking in: ignore whatever times were sent and use now().
      new.clock_in     := now();
      new.recorded_in  := now();
      new.clock_out    := null;
      new.recorded_out := null;
    else
      new.recorded_in  := null;
      new.recorded_out := null;
    end if;
  else
    -- These can never be changed after the row exists.
    new.user_id      := old.user_id;
    new.source       := old.source;
    new.recorded_in  := old.recorded_in;
    new.recorded_out := old.recorded_out;
    new.created_at   := old.created_at;

    if old.source = 'clock' and old.clock_out is null and new.clock_out is not null then
      -- Clocking out: ignore the time sent and use now().
      new.clock_out    := now();
      new.recorded_out := now();
    elsif old.clock_out is not null and new.clock_out is null then
      raise exception 'A finished session cannot be restarted' using errcode = 'check_violation';
    end if;
  end if;

  if new.clock_out is not null and new.clock_out > now() then
    raise exception 'A session cannot end in the future' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger work_sessions_database_clock
  before insert or update on public.work_sessions
  for each row execute function public.work_sessions_database_clock();
