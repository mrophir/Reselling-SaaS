-- Run this once in the Supabase SQL Editor (Database → SQL Editor → New query)
-- https://app.supabase.com/project/_/sql

-- ── items ──────────────────────────────────────────────────────────────────
create table if not exists public.items (
  id          bigserial primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  code        text        not null default '',
  name        text        not null,
  cond        text        not null default 'good',
  paid        numeric(10,2) not null default 0,
  stage       text        not null default 'unlisted',
  bin         text,
  platform    text[],
  notes       text,
  size        text,
  created_at  timestamptz not null default now()
);

alter table public.items enable row level security;

create policy "users manage own items"
  on public.items for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── sale_records ────────────────────────────────────────────────────────────
create table if not exists public.sale_records (
  id               bigserial primary key,
  user_id          uuid          not null references auth.users(id) on delete cascade,
  item_id          bigint        references public.items(id) on delete set null,
  item_name        text          not null,
  paid             numeric(10,2) not null default 0,
  sold_for         numeric(10,2) not null default 0,
  profit           numeric(10,2) not null default 0,
  month            text          not null,
  platform         text,
  ad_cost          numeric(10,2),
  packaging_cost   numeric(10,2),
  equipment_cost   numeric(10,2),
  other_cost       numeric(10,2),
  created_at       timestamptz   not null default now()
);

alter table public.sale_records enable row level security;

create policy "users manage own sale records"
  on public.sale_records for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── storage_locations ───────────────────────────────────────────────────────
create table if not exists public.storage_locations (
  id         bigserial primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.storage_locations enable row level security;

create policy "users manage own storage locations"
  on public.storage_locations for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
