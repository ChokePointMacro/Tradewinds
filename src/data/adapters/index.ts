import type { PriceSource, ProjectsDataSource, RouteSource, SupplyDataSource } from './types';
import { MockPriceSource } from './mock/MockPriceSource';
import { MockSupplyDataSource } from './mock/MockSupplyDataSource';
import { MockProjectsDataSource } from './mock/MockProjectsDataSource';
import { LivePriceSource } from './live/LivePriceSource';
import { FlaggedPriceSource } from './live/FlaggedPriceSource';
import { LiveSupplyDataSource } from './live/LiveSupplyDataSource';
import { FlaggedSupplyDataSource } from './live/FlaggedSupplyDataSource';
import { SearouteRouteSource } from './live/SearouteRouteSource';

export type { PriceSource, ProjectsDataSource, RouteSource, SupplyDataSource } from './types';

// PRD 6.2: a single env flag selects the implementation. Phase 1 wires the live
// price proxy (gated by the `live-prices` PostHog flag, with mock fallback).
// Phase 2 routing uses searoute-ts client-side (no API key, deterministic), so
// it is the default in both modes; it self-falls-back to a great-circle arc.
const MODE = import.meta.env.VITE_DATA_MODE ?? 'mock';

const mockPrices = new MockPriceSource();
const mockSupply = new MockSupplyDataSource();

export const priceSource: PriceSource =
  MODE === 'live' ? new FlaggedPriceSource(new LivePriceSource(), mockPrices) : mockPrices;

export const routeSource: RouteSource = new SearouteRouteSource();

// In live mode, net trade is upgraded to SOURCED via the UN Comtrade proxy
// (behind the `live-trade` PostHog flag), falling back to MODELED seed on any
// error. Production/reserves/ports remain seed-backed.
export const supplyDataSource: SupplyDataSource =
  MODE === 'live'
    ? new FlaggedSupplyDataSource(new LiveSupplyDataSource(), mockSupply)
    : mockSupply;

// Energy projects are curated SOURCED seed in both modes (no live feed yet).
export const projectsDataSource: ProjectsDataSource = new MockProjectsDataSource();

export const DATA_MODE = MODE;
