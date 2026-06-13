-- Tradewinds schema (PRD Section 9.2). Single-tenant MVP; org_id columns added
-- now so the Phase-2 multi-tenant RLS migration (Section 20) is additive.

create table if not exists commodities (
  id text primary key,
  name text not null,
  category text not null,
  native_unit text not null,
  benchmark text not null,
  price_symbol text not null,
  chain_template_id text not null
);

create table if not exists cost_parameters (
  key text primary key,
  commodity_id text references commodities(id),
  label text not null,
  value numeric not null,
  unit text not null,
  provenance text not null check (provenance in ('SOURCED', 'MODELED')),
  source_note text,
  min_value numeric,
  max_value numeric
);

create table if not exists ports (
  id text primary key,
  name text,
  country text,
  lat double precision,
  lng double precision,
  role text[]
);

create table if not exists chokepoints (
  id text primary key,
  name text,
  lat double precision,
  lng double precision,
  passage_key text,
  note text,
  bypass text
);

create table if not exists price_cache (
  commodity_id text references commodities(id),
  kind text check (kind in ('spot', 'history')),
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (commodity_id, kind)
);

create table if not exists price_history (
  commodity_id text references commodities(id),
  date date not null,
  close numeric not null,
  primary key (commodity_id, date)
);

create table if not exists routes_cache (
  from_port text,
  to_port text,
  closed_passages text[],
  result jsonb not null,
  fetched_at timestamptz default now(),
  primary key (from_port, to_port, closed_passages)
);

create table if not exists scenarios (
  id uuid primary key default gen_random_uuid(),
  org_id text default 'default', -- becomes Clerk org id in Phase 2
  name text not null,
  commodity_id text references commodities(id),
  config jsonb not null,
  created_at timestamptz default now()
);
