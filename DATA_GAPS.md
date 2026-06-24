# Data Gap Register

Living register (PRD Section 18). Append new gaps discovered during the build. Do **not** invent
real-world numbers — flag them here instead.

## Open architecture questions (resolved at kickoff)

- **Q-ARCH-1** Framework — **Vite + React SPA** (chosen). Serverless proxy lives in `/api` as
  standalone Vercel functions.
- **Q-ARCH-2** Map — **MapLibre GL** (chosen).
- **Q-ARCH-3** Routing on client vs server — **deferred to Phase 2**; Phase 0 uses a mock
  great-circle approximation. Default target: client `searoute-ts`, move to server if bundle size
  becomes a problem.
- **Q-ARCH-4** Forecast — **GBM fan** (default), Monte Carlo as a stretch. Built in Phase 1.

## Known data gaps (defaults seeded but flagged)

- **DATA-PRICE-1** Free price API monthly caps may be tight — mitigate via cache + local history
  accumulation (Phase 1).
- **DATA-HIST-1** Free tiers may limit history depth — mitigate via FRED + local accumulation.
- **DATA-COST-1** All cost-structure defaults in `src/data/cost/parameters.ts` are MODELED
  placeholders. Owner to compare to SOURCED figures (D3) and record deltas here.
- **DATA-FREIGHT-1** Worldscale → $/bbl conversion needs a reference voyage + current flat rates;
  the Phase 0 freight model is a coarse placeholder.
- **DATA-GEO-1** Port and chokepoint coordinates (`src/data/geo`) are approximate — verify against
  World Port Index / Natural Earth.
- **DATA-HORMUZ-1** Pipeline bypass capacities change; encoded as a note, not a hard number.
- **DATA-AIR-1** Secured air-freight cost model for gold needs real quotes (Brink's/Loomis).
- **DATA-SUPPLY-YEAR-1** Supply data is annual (seed year 2024) — surface the data year prominently.
- **DATA-REFINE-1** Gold refining concentration (Switzerland) and silver industrial-demand split are
  qualitative notes; quantify with WGC / Silver Institute if needed.

## Phase 1 implementation notes

- **DATA-PRICE-2** The serverless mapper (`api/_lib/priceMapper.ts`) assumes CommodityPriceAPI's
  `/latest` and `/timeseries` shape with **base=USD rates quoted as commodity-units-per-USD** (so USD
  price = `1/rate`). The exact field names, auth header, and whether oil is also inverted must be
  confirmed against the live provider docs at cutover — adjust `PROVIDER_CONFIG` / endpoint URLs in
  `provider.ts` accordingly. Mapper is unit-tested, so a shape change is a localized edit.
- **BLOCKER-LIVE-1** Live price cutover needs the owner's `PRICE_API_KEY` (+ `PRICE_API_PROVIDER`)
  and `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` set as Vercel env vars. Until then `VITE_DATA_MODE`
  stays `mock`; with `live` set, the proxy returns 503 and the client transparently falls back to mock.

## ChokepointMacro report build (processing chokepoint, technology BOM, criticality)

- **DATA-PROC-1** Midstream processing-concentration shares in
  `src/data/processing/processingConcentration.ts` (e.g. gallium ~99%, REE separation ~90%,
  tungsten ~83%, battery-grade graphite ~80%, refined lithium >60%, Russia ~44% of SWU) are the
  ChokepointMacro "Twenty-Year Bottleneck" report's synthesis of IEA Critical Minerals Outlook 2025
  and USGS figures. Tagged SOURCED to the report + agency; the report's own appendix flags these as
  analytical judgments to **re-verify against primary IEA/USGS sources** before any investment use.
- **DATA-TECH-1** The Technology→Mineral→Processing bill-of-materials
  (`src/data/technology/technologies.ts`) draws on the report's §3 sector lists, §5 advancements
  table (advancement ranks, maturity, scale windows) and §7 minerals matrix. Several BOM rows name
  inputs with no commodity record yet (GOES, hard carbon, SiC, high-purity quartz, iron-air) —
  `commodityId` is left blank for those rather than mis-linking.
- **DATA-CRIT-1** The criticality forward curve (`src/data/criticality/criticality.ts`) is MODELED:
  base = 0.45 × leading-processor share + substitutability + 2035-gap + export-control penalty, then
  substitution/recycling/diversification modifiers ramp linearly over their report-cited windows.
  Modifier magnitudes (e.g. sodium-ion −12 on lithium by 2029) are calibrated estimates, not
  forecasts — tune against IEA scenario data when available.
- **DATA-RESIL-PROC-1** Adding the processing pillar shifts the **headline Resilience score** for
  commodities with a midstream entry (rare earths, gallium, lithium, graphite, cobalt, tungsten,
  manganese, copper, uranium, polysilicon): their weights move to 25/20/25/30 (mine/jurisdiction/
  processing/chokepoint). Commodities without a midstream entry keep the original 35/30/35 split, so
  oil, gold, silver, palladium and the food chains are unchanged.

## Innovations tracker + magnet supply-chain tabs

- **DATA-VENT-1** Venture financing figures in `src/data/innovations/innovations.ts` (e.g. MP DoD
  $0.4B equity + $110/kg floor, Apple $0.5B recycling prepay, X-energy Amazon round, Redwood DOE
  loan, LIS $1.38B Oak Ridge plan) are point-in-time PUBLIC deal values synthesised from the
  ChokepointMacro briefings + company disclosures. Re-verify against primary filings before any
  investment use; undisclosed amounts are rendered `n/d`, never estimated. Milestone dates are
  reported approximate (YYYY-MM).
- **DATA-MAGCOST-1** Per-stage USD/kg costs in `src/data/magnetchain/magnetChain.ts` are MODELED
  illustrative splits of a representative ~$75/kg finished sintered-NdFeB value — they move with
  NdPr/Dy/Tb prices, grade (N35→N52, none→AH) and scale. The China-share concentration figures
  (mining ~70%, separation ~90%, magnet-making ~90–94%) are SOURCED to the briefings (IEA/IDTechEx/MP).
  Route-map node coordinates are approximate facility locations for visualisation only.

## Phase 0 implementation notes

- Mock supply production/reserves figures (`MockSupplyDataSource`) are illustrative placeholders for
  UI layout, labelled SOURCED-shaped with data year 2024. Replace with USGS (metals) / EIA (oil)
  pulls in a later phase.
- Mock route distances use haversine × a coarse per-closed-lane penalty factor — replace with
  searoute in Phase 2 for canal/strait-aware distances.
