// Domain types — single source of truth (PRD Section 9.1).
// Every number rendered in the UI must carry a Provenance badge.

import type { Feature, LineString } from 'geojson';

export type Unit = 'bbl' | 'ozt' | 'tonne' | 'kg';
export type Provenance = 'SOURCED' | 'MODELED';

export type CommodityCategory =
  | 'energy'
  | 'precious_metal'
  | 'base_metal'
  | 'critical_mineral'
  | 'rare_earth'
  | 'semiconductor'
  | 'gas'
  | 'chemical'
  | 'fertilizer'
  | 'agriculture';

export type TransportMode = 'sea' | 'air';
export type VesselType = 'VLCC' | 'Suezmax' | 'Aframax' | 'Container' | 'Bulk';

export interface Commodity {
  id: string; // 'crude_oil' | 'gold' | 'silver'
  name: string;
  category: CommodityCategory;
  nativeUnit: Unit; // bbl, ozt
  benchmark: string; // 'WTI', 'Brent', 'LBMA Gold', 'LBMA Silver'
  priceSymbol: string; // provider symbol, e.g. 'WTIOIL-FUT','XAU','XAG'
  chainTemplateId: string; // links to a tailored supply chain template
}

export interface StepConfigurable {
  type: 'country' | 'location' | 'lane' | 'toggle';
  label: string;
  options: string[]; // e.g. refining countries; storage locations; lanes
  default: string;
}

export interface SupplyChainStep {
  id: string;
  order: number;
  key: string; // 'prospecting' | 'extraction' | 'refining' | ...
  label: string;
  description: string;
  // specifics shown on the card (free-form but typed buckets):
  specifics: Record<string, string | number>;
  // which cost parameters feed this step's estimate:
  costParamKeys: string[];
  provenanceByField?: Record<string, Provenance>;
  configurable?: StepConfigurable[];
}

export interface CostParameter {
  key: string; // 'gold.aisc'
  commodityId: string;
  label: string;
  value: number; // editable default
  unit: string; // 'USD/ozt', 'USD/bbl', 'USD/tonne-nm'
  provenance: Provenance;
  sourceNote?: string; // citation for the default
  min?: number;
  max?: number; // UI slider bounds
}

export interface Port {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  role: ('export' | 'import')[];
  mode?: TransportMode[]; // air node (airport) vs sea port
}

export interface Chokepoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  passageKey: string;
  note: string;
  bypass?: string;
}

export interface RouteRequest {
  fromPortId: string;
  toPortId: string;
  closedPassages: string[]; // chokepoints toggled closed
  mode?: TransportMode;
  vesselType?: VesselType;
}

export interface RouteResult {
  geojson: Feature<LineString>;
  distanceNm: number;
  transitDays: number;
  passagesUsed: string[];
  provenance: Provenance; // SOURCED if from routing network, MODELED if arc fallback
  note?: string; // e.g. 'No maritime bypass of Hormuz'
  constrained?: boolean; // true when no clean reroute exists (Hormuz case)
}

export interface SpotQuote {
  commodityId: string;
  price: number;
  unit: Unit;
  currency: 'USD';
  asOfISO: string;
  source: string;
  stale?: boolean;
}

export interface PricePoint {
  dateISO: string;
  close: number;
}

export interface CountryProduction {
  country: string;
  amount: number;
  unit: string;
  year: number;
  source?: string; // named agency dataset (USGS MCS, EIA)
  sourceUrl?: string;
}

export interface CountryReserves {
  country: string;
  amount: number;
  unit: string;
  year: number;
  source?: string;
  sourceUrl?: string;
}

// Net trade balance: positive = net exporter, negative = net importer.
// Seed values are MODELED; the live UN Comtrade path returns SOURCED rows
// tagged per-row so the overlay badge stays honest even under seed fallback.
export interface CountryTradeBalance {
  country: string;
  netExport: number;
  unit: string;
  year: number;
  provenance?: Provenance;
  source?: string;
}

// Port-activity tiles (Ports tab). Headline throughput is SOURCED-shaped seed
// data; declared value, cargo mix and trading-partner shares are MODELED.
export type PortRole = 'export' | 'import' | 'hub';

export interface PortCargoSlice {
  label: string; // e.g. 'Crude', 'Condensate', 'Fuel oil'
  sharePct: number; // share of this port's commodity throughput (MODELED)
}

export interface PortTradePartner {
  country: string;
  sharePct: number; // share of this port's commodity flow (MODELED)
  direction: 'export' | 'import';
}

export interface CommodityPortActivity {
  id: string;
  commodityId: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  role: PortRole;
  volume: number; // commodity-specific throughput (SOURCED, cited dataset)
  volumeUnit: string; // 'Mbbl/d', 'kt/yr', 't/yr'
  cargoType: string; // primary cargo descriptor
  source?: string; // throughput citation (port rankings)
  sourceUrl?: string;
  year: number;
  // DEPRECATED guesses — no longer rendered (dropped at the adapter boundary,
  // see PRODUCTION_AUDIT.md). Kept optional so legacy seed data still types.
  valueDeclaredUsdB?: number;
  cargoMix?: PortCargoSlice[];
  partners?: PortTradePartner[];
}

// Ports tab "Trade detail" — a port country's item profile + top partner
// countries for the commodity, from UN Comtrade (SOURCED, country-level).
export interface PortItemProfile {
  exportUsdB: number;
  importUsdB: number;
  exportSharePct: number;
  year: number;
  source: string;
}

export interface PortPartnerShare {
  country: string;
  iso?: string; // ISO3, for placing trade lanes on the map
  sharePct: number;
  valueUsdB: number;
  direction: 'export' | 'import';
}

export interface PortTradeDetail {
  profile: PortItemProfile | null;
  partners: PortPartnerShare[];
  year: number;
}

// Projects tab: US energy & advanced-manufacturing infrastructure tracker
// (nuclear, data centers, semiconductor fabs, and other generation), 2022
// forward. Every figure is publicly reported (SOURCED) and carries a named
// source + URL; unverifiable fields are simply omitted rather than estimated.
// This tab is NOT tied to the commodity selector.
export type EnergyProjectType =
  | 'nuclear'
  | 'data_center'
  | 'semiconductor'
  | 'solar'
  | 'wind'
  | 'storage'
  | 'geothermal'
  | 'gas';

export type ProjectStatus =
  | 'announced'
  | 'permitting'
  | 'under_construction'
  | 'partially_operational'
  | 'operational';

export interface EnergyProject {
  id: string;
  name: string;
  type: EnergyProjectType;
  developer: string; // owner / developer / operator
  state: string; // US state
  location?: string; // city / county
  capacityMw?: number; // MW generation, or MW power draw for data centers
  capacityNote?: string; // clarifier, e.g. '+ 380 MW/1,400 MWh storage'
  status: ProjectStatus;
  announcedYear?: number;
  onlineYear?: number; // actual or expected commercial operation
  investmentUsdB?: number; // total project capex, USD billions (when reported)
  investmentNote?: string; // caveat when a figure isn't total capex
  note: string; // one line on why it's notable
  source: string; // publication
  sourceUrl: string;
}

// Bridge Power tab: on-site / "behind-the-meter" generation that data centers
// are deploying to get electrons NOW while permanent generation (and grid
// interconnection) is still years out. Standalone — NOT commodity-scoped.
// Every figure is publicly reported (SOURCED) with a named source + URL.
export type BridgePowerType =
  | 'mobile_gas_turbine' // trailer-mounted / aeroderivative, rapidly deployable
  | 'gas_turbine' // fixed simple- or combined-cycle frame turbines, co-located
  | 'gas_engine' // natural-gas reciprocating engines (Cat, INNIO, Cummins)
  | 'fuel_cell' // solid-oxide fuel cells (Bloom Energy)
  | 'diesel_genset'; // diesel reciprocating sets (the legacy backup tier)

export interface BridgePowerDeployment {
  id: string;
  name: string;
  type: BridgePowerType;
  provider: string; // turbine/genset/fuel-cell supplier or power provider
  offtaker?: string; // the data center / hyperscaler being served
  state: string; // US state, or 'Multiple' / 'Undisclosed' when not sited
  location?: string; // city / county
  capacityMw?: number; // announced/installed electrical capacity (when reported)
  unitsNote?: string; // e.g. '35 mobile turbines', '7 × 7HA.02'
  status: ProjectStatus; // reuses the energy-project pipeline enum
  announcedYear?: number;
  onlineYear?: number;
  bridge: boolean; // true = explicitly temporary/interim; false = dedicated permanent
  bridgeNote?: string; // what it bridges to, or why it's permanent
  investmentUsdB?: number; // deal/capex value when reported
  note: string;
  source: string;
  sourceUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Midstream processing concentration — "refining, not mining, is the chokepoint"
// (ChokepointMacro, The Twenty-Year Bottleneck, Jun 2026). Three stacked layers:
//   Layer 1 — mineral processing & separation (REE separation, Li conversion…)
//   Layer 2 — heavy industrial equipment (transformers, GOES, magnet sintering…)
//   Layer 3 — fuel-cycle / feedstock single points of failure (HALEU enrichment…)
// A mineral with diversified MINING but ~90% Chinese SEPARATION is far more
// fragile than its mine-based score suggests; this captures that asymmetry.
// ─────────────────────────────────────────────────────────────────────────────
export type ProcessingLayer = 1 | 2 | 3;

export type ProcessingStepKind =
  | 'separation' // solvent extraction, ionic-clay separation (REE)
  | 'refining' // smelt/convert to spec-grade metal or chemical
  | 'recovery' // by-product recovery (gallium from alumina, Ge from zinc)
  | 'enrichment' // fuel-cycle (HALEU / SWU)
  | 'manufacturing'; // magnet sintering, cell-making, transformer/GOES fabrication

export type Substitutability = 'very_low' | 'low' | 'medium' | 'high';
export type GapRisk = 'low' | 'medium' | 'high' | 'severe';

export interface ProcessingConcentration {
  commodityId: string;
  step: string; // human label, e.g. 'Solvent-extraction separation'
  kind: ProcessingStepKind;
  layer: ProcessingLayer;
  leadingCountry: string; // dominant midstream processor (usually China)
  sharePct: number; // leading country's share of global midstream capacity
  substitutability: Substitutability;
  gap2035: GapRisk; // closing-the-gap-to-2035 difficulty
  exportControlled?: boolean; // subject to an active export-control lever
  note: string;
  source: string;
  sourceUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Technology → Mineral → Processing bill-of-materials (Recommendation 2).
// Each emerging demand-driver technology links to the minerals AND the specific
// processing steps it depends on, each tagged with concentration / substitut-
// ability / 2035 gap. Answers: "if technology X scales, which choke points
// tighten?" The advancement metadata mirrors the report's Section-5 table.
// ─────────────────────────────────────────────────────────────────────────────
export type TechMaturity =
  | 'rd' // R&D
  | 'demo' // demonstration scale
  | 'pilot' // pilot
  | 'early_commercial' // early commercial / scaling
  | 'mature_capacity_short'; // mature tech, capacity-constrained

export type DemandWave =
  | 'ai_compute'
  | 'electrification'
  | 'firm_power'
  | 'defense'
  | 'physical_ai';

// A single line of a technology's bill of materials.
export interface TechMineralLink {
  commodityId: string; // links into the commodity registry where one exists
  mineral: string; // display name (may differ / aggregate, e.g. 'NdPr')
  role: string; // what it does in the technology
  processingStep: string; // the specific midstream step it leans on
  concentration: string; // e.g. 'China ~90% separation'
  substitutability: Substitutability;
  gap2035: GapRisk;
}

export interface Technology {
  id: string;
  name: string;
  sector: string; // report section, e.g. 'Batteries & storage'
  waves: DemandWave[]; // demand megatrends pulling on it
  thesis: string; // one line on the technology's role
  // Section-5 "advancement that must mature" metadata (when this tech IS one):
  advancementRank?: number; // # in the report's leverage table (1 = highest)
  relieves?: string; // the bottleneck it relieves
  maturity: TechMaturity;
  scaleWindow: string; // commercial-scale window, e.g. '2026–2032'
  isSubstitution?: boolean; // true = a substitution/recycling lever that LOWERS criticality
  bom: TechMineralLink[];
  source: string;
  sourceUrl?: string;
}

export interface Scenario {
  id: string;
  name: string;
  commodityId: string;
  route: RouteRequest;
  costOverrides: Record<string, number>;
  storageTogglesOn: string[];
  refiningCountry?: string;
  createdAtISO: string;
}
