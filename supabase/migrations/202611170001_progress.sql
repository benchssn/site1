-- Learning progress for series and studies. Written only through the server API.
create table public.member_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  work text not null check (work ~ '^[a-z0-9-]{1,64}$'),
  position_seconds integer not null default 0 check (position_seconds between 0 and 86400),
  completed_at timestamptz,
  updated_at timestamptz not null default clock_timestamp(),
  primary key (user_id, work)
);

alter table public.member_progress enable row level security;
revoke all on public.member_progress from public, anon, authenticated;
grant select on public.member_progress to service_role;

create function public.record_progress(member uuid, work_slug text, position integer, done boolean)
returns void language sql set search_path = '' as $$
  insert into public.member_progress (user_id, work, position_seconds, completed_at, updated_at)
  values (member, work_slug, position, case when done then pg_catalog.clock_timestamp() end, pg_catalog.clock_timestamp())
  on conflict (user_id, work) do update set
    position_seconds = excluded.position_seconds,
    completed_at = coalesce(public.member_progress.completed_at, excluded.completed_at),
    updated_at = excluded.updated_at;
$$;

revoke all on function public.record_progress(uuid, text, integer, boolean) from public, anon, authenticated;
grant execute on function public.record_progress(uuid, text, integer, boolean) to service_role;
