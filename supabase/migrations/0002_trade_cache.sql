-- UN Comtrade net-trade proxy cache (PRD §6.2 adapter pattern, §16 caching).
-- One Comtrade all-reporters call covers every country for a commodity, so a
-- single cached row per commodity is sufficient. Long-lived: annual trade data
-- is effectively static once reported.
create table if not exists trade_cache (
  commodity_id text references commodities(id),
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (commodity_id)
);
