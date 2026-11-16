create table public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  access_until timestamptz,
  sync_revision bigint not null default 0
);

alter table public.billing_customers enable row level security;
revoke all on public.billing_customers from anon, authenticated;
grant select, insert, update on public.billing_customers to service_role;

create sequence public.billing_sync_revision;

create function public.next_billing_revision() returns bigint
language sql
set search_path = ''
as $$ select pg_catalog.nextval('public.billing_sync_revision'::regclass); $$;

revoke all on function public.next_billing_revision() from public, anon, authenticated;
grant execute on function public.next_billing_revision() to service_role;
grant usage on sequence public.billing_sync_revision to service_role;

insert into storage.buckets (id, name, public)
values ('member-media', 'member-media', false);

