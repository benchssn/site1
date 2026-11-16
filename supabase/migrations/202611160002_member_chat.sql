create table public.chat_messages (
  id bigint generated always as identity primary key,
  author_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index chat_messages_author_latest
  on public.chat_messages (author_id, created_at desc);

alter table public.chat_messages enable row level security;
revoke all on public.chat_messages from public, anon, authenticated;
grant select, insert on public.chat_messages to service_role;
grant usage on sequence public.chat_messages_id_seq to service_role;

create function public.post_chat_message(member_id uuid, message_body text)
returns text language plpgsql set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(member_id::text, 0));
  if not exists (
    select 1 from public.billing_customers
    where user_id = member_id and access_until > pg_catalog.clock_timestamp()
  ) then
    return 'forbidden';
  end if;

  if exists (
    select 1 from public.chat_messages where author_id = member_id
    and created_at > pg_catalog.clock_timestamp() - interval '3 seconds'
  ) then
    return 'slow_down';
  end if;

  insert into public.chat_messages (author_id, body, created_at)
  values (member_id, message_body, pg_catalog.clock_timestamp());
  return 'sent';
end;
$$;

revoke all on function public.post_chat_message(uuid, text) from public, anon, authenticated;
grant execute on function public.post_chat_message(uuid, text) to service_role;

