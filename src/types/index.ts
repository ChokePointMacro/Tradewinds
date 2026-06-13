// Domain types — single source of truth (PRD Section 9.1).
// Every number rendered in the UI must carry a Provenance badge.

import type { Feature, LineString } from 'geojson';

export type Unit = 'bbl' | 'ozt' | 'tonne' | 'kg';
export type Provenance = 'SOURCED' | 'MODELED';

export type CommodityCategory =
  | 'energy'
  | 'precious_metal'
  | 'base_metal'
  | 'rare_earth'
  | 'gas'
  | 'chemical'
  | 'fertilizer';

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
}

export interface CountryReserves {
  country: string;
  amount: number;
  unit: string;
  year: number;
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
  volume: number; // commodity-specific throughput (SOURCED·seed)
  volumeUnit: string; // 'Mbbl/d', 'kt/yr', 't/yr'
  valueDeclaredUsdB: number; // declared trade value, USD bn/yr (MODELED)
  cargoType: string; // primary cargo descriptor
  cargoMix: PortCargoSlice[]; // composition breakdown (MODELED)
  partners: PortTradePartner[]; // top trading partners (MODELED)
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
