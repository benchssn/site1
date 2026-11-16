create table public.collective_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z][a-z0-9_]{2,23}$'),
  show_online boolean not null default true,
  moderator boolean not null default false,
  suspended_at timestamptz
);

create table public.collective_rooms (
  id text primary key check (id in ('commons', 'mind', 'laboratory'))
);
insert into public.collective_rooms (id) values ('commons'), ('mind'), ('laboratory');

create table public.collective_messages (
  id bigint generated always as identity primary key,
  room text not null references public.collective_rooms(id),
  author_id uuid references public.collective_profiles(id) on delete set null,
  request_id uuid not null,
  body text check (body is null or char_length(body) between 1 and 1000),
  created_at timestamptz not null default clock_timestamp(),
  removed_at timestamptz,
  unique (author_id, request_id)
);
create index collective_room_history on public.collective_messages (room, id desc) where body is not null;
create index collective_author_activity on public.collective_messages (author_id, created_at desc);

create table public.collective_events (
  room text primary key references public.collective_rooms(id),
  latest_message bigint not null default 0,
  revision bigint not null default 0,
  changed_message bigint,
  operation text
);
insert into public.collective_events (room) select id from public.collective_rooms;

create table public.collective_presence (
  profile_id uuid primary key references public.collective_profiles(id) on delete cascade,
  room text not null references public.collective_rooms(id),
  seen_at timestamptz not null default clock_timestamp()
);
create index collective_presence_recent on public.collective_presence (seen_at desc);

create table public.collective_mutes (
  member_id uuid not null references public.collective_profiles(id) on delete cascade,
  muted_id uuid not null references public.collective_profiles(id) on delete cascade,
  check (member_id <> muted_id),
  primary key (member_id, muted_id)
);

create table public.collective_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid references public.collective_profiles(id) on delete set null,
  message_id bigint not null references public.collective_messages(id),
  reason text not null check (reason in ('Harassment','Spam','Privacy concern','Other guideline violation')),
  created_at timestamptz not null default clock_timestamp(),
  resolved_at timestamptz,
  unique (reporter_id, message_id)
);
create index collective_pending_reports on public.collective_reports (id) where resolved_at is null;
create index collective_reporter_activity on public.collective_reports (reporter_id, created_at desc);

-- Move prior lounge messages to The Commons with pseudonymous profiles.
insert into public.collective_profiles (user_id, username)
select author_id, 'member_' || left(replace(gen_random_uuid()::text, '-', ''), 17)
from (select distinct author_id from public.chat_messages where author_id is not null) authors;
insert into public.collective_messages (room, author_id, request_id, body, created_at)
select 'commons', profile.id, gen_random_uuid(), old.body, old.created_at
from public.chat_messages old left join public.collective_profiles profile on profile.user_id = old.author_id
order by old.id;
update public.collective_events
set latest_message = coalesce((select max(id) from public.collective_messages), 0)
where room = 'commons';

alter table public.collective_rooms enable row level security;
alter table public.collective_profiles enable row level security;
alter table public.collective_messages enable row level security;
alter table public.collective_events enable row level security;
alter table public.collective_presence enable row level security;
alter table public.collective_mutes enable row level security;
alter table public.collective_reports enable row level security;

revoke all on public.collective_rooms, public.collective_profiles, public.collective_messages,
  public.collective_events, public.collective_presence, public.collective_mutes, public.collective_reports
  from public, anon, authenticated;
grant select on public.collective_rooms, public.collective_profiles, public.collective_messages,
  public.collective_events, public.collective_presence, public.collective_mutes, public.collective_reports to service_role;
grant insert, update on public.collective_profiles, public.collective_messages,
  public.collective_events, public.collective_presence, public.collective_mutes, public.collective_reports to service_role;
grant delete on public.collective_mutes, public.collective_presence to service_role;
grant usage on sequence public.collective_messages_id_seq, public.collective_reports_id_seq to service_role;

-- Realtime can see room activity only. Message text and profiles are served through the private API.
create function public.collective_can_stream() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.billing_customers b
    join public.collective_profiles p on p.user_id = b.user_id
    where b.user_id = (select auth.uid()) and b.access_until > statement_timestamp() and p.suspended_at is null
  );
$$;
revoke all on function public.collective_can_stream() from public, anon;
grant execute on function public.collective_can_stream() to authenticated;
grant select on public.collective_events to authenticated;
create policy collective_members_can_stream on public.collective_events
  for select to authenticated using ((select public.collective_can_stream()));
alter publication supabase_realtime add table public.collective_events;

create function public.collective_record_event() returns trigger
language plpgsql set search_path = '' as $$
begin
  update public.collective_events set
    revision = revision + 1,
    latest_message = case when tg_op = 'INSERT' then greatest(latest_message, new.id) else latest_message end,
    changed_message = new.id,
    operation = case when tg_op = 'INSERT' then 'message' else 'remove' end
  where room = new.room;
  return new;
end;
$$;
revoke all on function public.collective_record_event() from public, anon, authenticated;
create trigger collective_message_event after insert or update of removed_at on public.collective_messages
  for each row execute function public.collective_record_event();

create function public.collective_write(actor uuid, action text, args jsonb) returns text
language plpgsql set search_path = '' as $$
declare
  stamp timestamptz := clock_timestamp();
  member public.collective_profiles%rowtype;
  msg public.collective_messages%rowtype;
  target uuid;
  message_key bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended(actor::text, 184));
  if not exists (select 1 from public.billing_customers where user_id = actor and access_until > clock_timestamp()) then
    return 'forbidden';
  end if;
  select * into member from public.collective_profiles where user_id = actor for update;
  if member.suspended_at is not null then return 'forbidden'; end if;

  if action = 'profile' then
    insert into public.collective_profiles (user_id, username, show_online)
    values (actor, args->>'username', (args->>'showOnline')::boolean)
    on conflict (user_id) do update set username = excluded.username, show_online = excluded.show_online;
    if not (args->>'showOnline')::boolean then
      delete from public.collective_presence where profile_id = member.id;
    end if;
    return 'ok';
  end if;
  if member.id is null then return 'profile_required'; end if;

  case action
    when 'heartbeat' then
      if member.show_online then
        insert into public.collective_presence (profile_id, room, seen_at)
        values (member.id, args->>'room', clock_timestamp())
        on conflict (profile_id) do update set room = excluded.room, seen_at = excluded.seen_at;
      end if;
    when 'send' then
      -- Serialize writes to a room so its activity and pagination follow commit order.
      perform 1 from public.collective_rooms where id = args->>'room' for update;
      if exists (select 1 from public.collective_messages where author_id = member.id and request_id = (args->>'requestId')::uuid) then
        return 'ok';
      end if;
      if exists (select 1 from public.collective_messages where author_id = member.id and created_at > clock_timestamp() - interval '2 seconds') then
        return 'slow_down';
      end if;
      insert into public.collective_messages (room, author_id, request_id, body)
      values (args->>'room', member.id, (args->>'requestId')::uuid, args->>'body');
    when 'delete' then
      message_key := (args->>'id')::bigint;
      select * into msg from public.collective_messages where id = message_key;
      if not found then return 'missing'; end if;
      if msg.author_id is distinct from member.id and not member.moderator then return 'forbidden'; end if;
      update public.collective_messages set body = null, removed_at = stamp where id = msg.id and removed_at is null;
      if member.moderator then
        update public.collective_reports set resolved_at = stamp where message_id = msg.id and resolved_at is null;
      end if;
    when 'report' then
      select * into msg from public.collective_messages where id = (args->>'id')::bigint and body is not null for update;
      if not found then return 'missing'; end if;
      if msg.author_id = member.id then return 'forbidden'; end if;
      if exists (select 1 from public.collective_reports where reporter_id = member.id and message_id = msg.id) then
        return 'ok';
      end if;
      if (select count(*) from public.collective_reports where reporter_id = member.id and created_at > stamp - interval '1 hour') >= 10 then
        return 'slow_down';
      end if;
      insert into public.collective_reports (reporter_id, message_id, reason) values (member.id, msg.id, args->>'reason');
    when 'mute', 'unmute' then
      target := (args->>'profileId')::uuid;
      if target = member.id then return 'forbidden'; end if;
      if not exists (select 1 from public.collective_profiles where id = target) then return 'missing'; end if;
      if action = 'mute' then
        insert into public.collective_mutes (member_id, muted_id) values (member.id, target) on conflict do nothing;
      else
        delete from public.collective_mutes where member_id = member.id and muted_id = target;
      end if;
    when 'suspend' then
      if not member.moderator then return 'forbidden'; end if;
      target := (args->>'profileId')::uuid;
      update public.collective_profiles set suspended_at = coalesce(suspended_at, stamp) where id = target and not moderator;
      if not found then return 'forbidden'; end if;
      delete from public.collective_presence where profile_id = target;
    when 'resolve' then
      if not member.moderator then return 'forbidden'; end if;
      update public.collective_reports set resolved_at = stamp where id = (args->>'id')::bigint and resolved_at is null;
    else
      return 'invalid';
  end case;
  return 'ok';
exception when unique_violation then
  return 'taken';
end;
$$;
revoke all on function public.collective_write(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.collective_write(uuid, text, jsonb) to service_role;

create function public.collective_online(viewer uuid) returns table(id uuid, username text, room text)
language sql stable set search_path = '' as $$
  select p.id, p.username, online.room
  from public.collective_presence online
  join public.collective_profiles p on p.id = online.profile_id
  join public.billing_customers b on b.user_id = p.user_id
  where online.seen_at > statement_timestamp() - interval '70 seconds'
    and b.access_until > statement_timestamp() and p.show_online and p.suspended_at is null
    and not exists (select 1 from public.collective_mutes m where m.member_id = viewer and m.muted_id = p.id)
  order by online.seen_at desc
  limit 100;
$$;
revoke all on function public.collective_online(uuid) from public, anon, authenticated;
grant execute on function public.collective_online(uuid) to service_role;


create function public.collective_history(viewer uuid, room_id text, before_id bigint)
returns table(id bigint, body text, created_at timestamptz, author jsonb)
language sql stable set search_path = '' as $$
  select msg.id, msg.body, msg.created_at,
    case when author.id is not null then jsonb_build_object('id', author.id, 'username', author.username) end
  from public.collective_messages msg
  left join public.collective_profiles author on author.id = msg.author_id
  where msg.room = room_id and msg.body is not null and (before_id is null or msg.id < before_id)
    and exists (
      select 1 from public.collective_profiles p join public.billing_customers b on p.user_id = b.user_id
      where p.id = viewer and p.suspended_at is null and b.access_until > statement_timestamp()
    )
    and not exists (
      select 1 from public.collective_mutes m where m.member_id = viewer and m.muted_id = msg.author_id
    )
  order by msg.id desc
  limit 41;
$$;
revoke all on function public.collective_history(uuid, text, bigint) from public, anon, authenticated;
grant execute on function public.collective_history(uuid, text, bigint) to service_role;
