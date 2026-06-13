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
export interface CountryTradeBalance {
  country: string;
  netExport: number;
  unit: string;
  year: number;
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
