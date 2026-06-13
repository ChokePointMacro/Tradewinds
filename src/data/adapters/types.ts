import type {
  CommodityPortActivity,
  CountryProduction,
  CountryReserves,
  CountryTradeBalance,
  PricePoint,
  RouteRequest,
  RouteResult,
  SpotQuote,
} from '@/types';

// Every external dependency is consumed via one of these interfaces (PRD 6.2).
// Two implementations exist for each: MockX and LiveX. Components NEVER call
// fetch directly — they go through adapters (via React Query hooks).

export interface PriceSource {
  getSpot(commodityId: string): Promise<SpotQuote>;
  getHistory(commodityId: string, fromISO: string, toISO: string): Promise<PricePoint[]>;
}

export interface RouteSource {
  getRoute(req: RouteRequest): Promise<RouteResult>;
}

export interface SupplyDataSource {
  getProductionByCountry(commodityId: string): Promise<CountryProduction[]>;
  getReserves(commodityId: string): Promise<CountryReserves[]>;
  getNetTrade(commodityId: string): Promise<CountryTradeBalance[]>;
  getPortActivity(commodityId: string): Promise<CommodityPortActivity[]>;
}
