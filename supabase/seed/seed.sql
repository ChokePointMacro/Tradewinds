-- Seed data for Tradewinds (PRD Sections 10–13).
-- Mirrors the TypeScript domain modules under src/data, which remain the
-- runtime source of truth in mock mode. Idempotent via upserts.

-- Commodities -----------------------------------------------------------------
insert into commodities (id, name, category, native_unit, benchmark, price_symbol, chain_template_id) values
  ('crude_oil', 'Crude Oil', 'energy', 'bbl', 'WTI / Brent', 'WTIOIL-FUT', 'chain_oil'),
  ('gold', 'Gold', 'precious_metal', 'ozt', 'LBMA Gold', 'XAU', 'chain_gold'),
  ('silver', 'Silver', 'precious_metal', 'ozt', 'LBMA Silver', 'XAG', 'chain_silver')
on conflict (id) do update set
  name = excluded.name, category = excluded.category, native_unit = excluded.native_unit,
  benchmark = excluded.benchmark, price_symbol = excluded.price_symbol,
  chain_template_id = excluded.chain_template_id;

-- Ports (DATA-GEO-1: approximate, verify against World Port Index) -------------
insert into ports (id, name, country, lat, lng, role) values
  ('ras_tanura', 'Ras Tanura', 'Saudi Arabia', 26.64, 50.16, array['export']),
  ('basra', 'Basra / Al Faw', 'Iraq', 29.98, 48.80, array['export']),
  ('houston', 'Houston', 'USA', 29.73, -95.27, array['import']),
  ('long_beach', 'Long Beach', 'USA', 33.75, -118.20, array['import']),
  ('rotterdam', 'Rotterdam', 'Netherlands', 51.95, 4.14, array['import']),
  ('shanghai', 'Shanghai', 'China', 31.23, 121.49, array['import']),
  ('ningbo', 'Ningbo-Zhoushan', 'China', 29.87, 121.55, array['import']),
  ('zurich', 'Zurich (refining/air hub)', 'Switzerland', 47.46, 8.55, array['import','export']),
  ('johannesburg', 'Johannesburg / OR Tambo', 'South Africa', -26.13, 28.24, array['export']),
  ('callao', 'Lima / Callao', 'Peru', -12.05, -77.14, array['export']),
  ('new_york', 'New York (vault/air)', 'USA', 40.64, -73.78, array['import'])
on conflict (id) do update set
  name = excluded.name, country = excluded.country, lat = excluded.lat,
  lng = excluded.lng, role = excluded.role;

-- Chokepoints -----------------------------------------------------------------
insert into chokepoints (id, name, lat, lng, passage_key, note, bypass) values
  ('hormuz', 'Strait of Hormuz', 26.57, 56.25, 'hormuz', 'No maritime bypass for Gulf crude; only limited pipeline bypass.', 'limited_pipeline_only'),
  ('suez', 'Suez Canal', 30.42, 32.35, 'suez', 'Reroutes around the Cape of Good Hope.', 'cape_of_good_hope'),
  ('babelmandeb', 'Bab-el-Mandeb', 12.60, 43.40, 'bab_el_mandeb', 'Reroutes around the Cape of Good Hope.', 'cape_of_good_hope'),
  ('panama', 'Panama Canal', 9.08, -79.68, 'panama', 'Reroutes via Magellan / around South America.', 'magellan_or_us_land'),
  ('malacca', 'Strait of Malacca', 2.50, 101.50, 'malacca', 'Reroutes via Sunda or Lombok strait.', 'sunda_or_lombok'),
  ('goodhope', 'Cape of Good Hope', -34.36, 18.47, 'cape', 'Reroute node (not a closable chokepoint).', null),
  ('gibraltar', 'Strait of Gibraltar', 35.95, -5.60, 'gibraltar', 'No bypass for Mediterranean access.', 'none'),
  ('taiwan', 'Taiwan Strait', 24.50, 119.50, 'taiwan', 'Reroutes east of Taiwan.', 'east_of_taiwan')
on conflict (id) do update set
  name = excluded.name, lat = excluded.lat, lng = excluded.lng,
  passage_key = excluded.passage_key, note = excluded.note, bypass = excluded.bypass;

-- Cost parameters (all MODELED placeholders; user-editable) --------------------
insert into cost_parameters (key, commodity_id, label, value, unit, provenance, source_note, min_value, max_value) values
  ('oil.exploration_amort', 'crude_oil', 'Exploration (amortized)', 3, 'USD/bbl', 'MODELED', 'Rystad/EIA, company 10-Ks', 0, 30),
  ('oil.sitebuild_amort', 'crude_oil', 'Appraisal & site build (amortized)', 5, 'USD/bbl', 'MODELED', 'company filings', 0, 40),
  ('oil.lifting_cost', 'crude_oil', 'Lifting/operating cost', 8, 'USD/bbl', 'MODELED', 'EIA, 10-Ks', 0, 60),
  ('oil.midstream_tariff', 'crude_oil', 'Pipeline/gathering tariff', 2, 'USD/bbl', 'MODELED', 'FERC/regional tariffs', 0, 15),
  ('oil.freight_ws_flat', 'crude_oil', 'Worldscale flat rate', 20, 'USD/bbl-equiv', 'MODELED', 'Worldscale, Baltic tanker', 0, 80),
  ('oil.freight_ws_pct', 'crude_oil', 'Worldscale % of flat', 100, '%', 'MODELED', 'Baltic Exchange', 10, 400),
  ('oil.bunker_cost', 'crude_oil', 'Bunker fuel component', 4, 'USD/bbl', 'MODELED', 'Ship & Bunker', 0, 30),
  ('oil.refining_margin', 'crude_oil', 'Refining margin/crack', 12, 'USD/bbl', 'MODELED', 'EIA crack spreads', 0, 50),
  ('oil.storage_cost', 'crude_oil', 'Storage', 0.5, 'USD/bbl/mo', 'MODELED', 'EIA/commercial tank rates', 0, 5),
  ('oil.vessel_speed_vlcc', 'crude_oil', 'VLCC speed', 13, 'knots', 'MODELED', 'industry typical', 8, 20),
  ('gold.exploration_amort', 'gold', 'Exploration (amortized)', 60, 'USD/ozt', 'MODELED', 'S&P Global, WGC', 0, 300),
  ('gold.minebuild_amort', 'gold', 'Permitting & mine build (amortized)', 150, 'USD/ozt', 'MODELED', 'company NI 43-101', 0, 600),
  ('gold.aisc', 'gold', 'All-In Sustaining Cost', 1350, 'USD/ozt', 'MODELED', 'World Gold Council, Metals Focus', 600, 2500),
  ('gold.refining_charge', 'gold', 'Refining/treatment charge', 5, 'USD/ozt', 'MODELED', 'refinery schedules', 0, 50),
  ('gold.fabrication_premium', 'gold', 'Fabrication/mint premium', 35, 'USD/ozt', 'MODELED', 'mint/dealer premiums', 0, 200),
  ('gold.secured_freight_pct', 'gold', 'Secured air freight (% value)', 0.3, '% of value', 'MODELED', 'Brink''s/Loomis quotes', 0, 3),
  ('gold.insurance_pct', 'gold', 'Transit insurance (% value)', 0.1, '% of value', 'MODELED', 'marine/air cargo insurers', 0, 2),
  ('gold.vault_storage', 'gold', 'Vault storage', 12, 'USD/ozt/yr', 'MODELED', 'LBMA vault providers', 0, 100),
  ('silver.exploration_amort', 'silver', 'Exploration (amortized)', 1.0, 'USD/ozt', 'MODELED', 'S&P Global', 0, 10),
  ('silver.minebuild_amort', 'silver', 'Mine build (amortized)', 2.0, 'USD/ozt', 'MODELED', 'company filings', 0, 15),
  ('silver.aisc_primary', 'silver', 'Primary-mine AISC', 16, 'USD/ozt', 'MODELED', 'Silver Institute / Metals Focus', 5, 40),
  ('silver.byproduct_credit', 'silver', 'By-product credit', 8, 'USD/ozt', 'MODELED', 'World Silver Survey', 0, 30),
  ('silver.refining_charge', 'silver', 'Refining charge', 0.3, 'USD/ozt', 'MODELED', 'refinery schedules', 0, 5),
  ('silver.fabrication_premium', 'silver', 'Fabrication premium', 2.0, 'USD/ozt', 'MODELED', 'dealer premiums', 0, 20),
  ('silver.freight_pct', 'silver', 'Secured freight (% value)', 0.4, '% of value', 'MODELED', 'logistics quotes', 0, 3),
  ('silver.vault_storage', 'silver', 'Vault storage', 0.5, 'USD/ozt/yr', 'MODELED', 'vault providers', 0, 5)
on conflict (key) do update set
  commodity_id = excluded.commodity_id, label = excluded.label, value = excluded.value,
  unit = excluded.unit, provenance = excluded.provenance, source_note = excluded.source_note,
  min_value = excluded.min_value, max_value = excluded.max_value;
