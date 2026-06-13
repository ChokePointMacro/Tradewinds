import type { PriceSource, RouteSource, SupplyDataSource } from './types';
import { MockPriceSource } from './mock/MockPriceSource';
import { MockSupplyDataSource } from './mock/MockSupplyDataSource';
import { LivePriceSource } from './live/LivePriceSource';
import { FlaggedPriceSource } from './live/FlaggedPriceSource';
import { SearouteRouteSource } from './live/SearouteRouteSource';

export type { PriceSource, RouteSource, SupplyDataSource } from './types';

// PRD 6.2: a single env flag selects the implementation. Phase 1 wires the live
// price proxy (gated by the `live-prices` PostHog flag, with mock fallback).
// Phase 2 routing uses searoute-ts client-side (no API key, deterministic), so
// it is the default in both modes; it self-falls-back to a great-circle arc.
const MODE = import.meta.env.VITE_DATA_MODE ?? 'mock';

const mockPrices = new MockPriceSource();

export const priceSource: PriceSource =
  MODE === 'live' ? new FlaggedPriceSource(new LivePriceSource(), mockPrices) : mockPrices;

export const routeSource: RouteSource = new SearouteRouteSource();
export const supplyDataSource: SupplyDataSource = new MockSupplyDataSource();

export const DATA_MODE = MODE;
