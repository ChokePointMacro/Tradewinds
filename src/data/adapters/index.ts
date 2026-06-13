import type { PriceSource, ProjectsDataSource, RouteSource, SupplyDataSource } from './types';
import { MockSupplyDataSource } from './mock/MockSupplyDataSource';
import { MockProjectsDataSource } from './mock/MockProjectsDataSource';
import { LivePriceSource } from './live/LivePriceSource';
import { LiveSupplyDataSource } from './live/LiveSupplyDataSource';
import { FlaggedSupplyDataSource } from './live/FlaggedSupplyDataSource';
import { SearouteRouteSource } from './live/SearouteRouteSource';

export type { PriceSource, ProjectsDataSource, RouteSource, SupplyDataSource } from './types';

// Production posture (2026-06-12): prices are LIVE-OR-ERROR. The mock price
// fallback is gone — the live proxy (keyless Yahoo by default) either returns a
// real quote or throws, and the UI renders a source-picker instead of a number.
// Routing uses searoute-ts client-side (no key, deterministic; self-falls-back to
// a great-circle arc).
//
// NOTE: supply (production/reserves/ports) and projects/bridge-power are still on
// the mock/seed path pending their per-tab conversion off mock — see
// PRODUCTION_AUDIT.md. `VITE_DATA_MODE` is retained only for those until migrated.
const MODE = import.meta.env.VITE_DATA_MODE ?? 'mock';

const mockSupply = new MockSupplyDataSource();

export const priceSource: PriceSource = new LivePriceSource();

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
