import type { RouteRequest, RouteResult } from '@/types';
import type { RouteSource } from '../types';
import { getPort } from '@/data/geo/ports';
import { getChokepoint } from '@/data/geo/chokepoints';
import { greatCircleArc, haversineNm } from '@/lib/geo';
import { AIR_SPEED_KN, vesselSpeed } from '@/lib/routing/vessels';
import {
  computeSeaRoute,
  isRecoverableRouteError,
  unenforceablePassages,
} from '@/lib/routing/searoute';

// Gulf-origin crude has no maritime bypass of Hormuz (PRD §11.4): show a warning,
// never a fake detour. Limited to terminals INSIDE the Persian Gulf — Fujairah,
// Sohar and Yanbu sit outside the strait and are not constrained.
const GULF_PORTS = new Set([
  'ras_tanura',
  'jubail',
  'basra',
  'kharg_island',
  'bandar_abbas',
  'jebel_ali',
  'ruwais',
  'ras_laffan',
  'kuwait',
]);

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Real maritime routing via searoute-ts, with the PRD's special cases encoded:
 * - SOURCED when the Eurostat network resolves the route;
 * - MODELED great-circle fallback when ports can't snap or no path exists;
 * - Hormuz constrained warning for Gulf crude (no reroute drawn);
 * - air mode = geodesic between airport nodes (MODELED).
 */
export class SearouteRouteSource implements RouteSource {
  async getRoute(req: RouteRequest): Promise<RouteResult> {
    const from = getPort(req.fromPortId);
    const to = getPort(req.toPortId);
    if (!from || !to) {
      throw new Error(`Unknown port in route request: ${req.fromPortId} → ${req.toPortId}`);
    }

    if (req.mode === 'air') {
      const nm = haversineNm(from, to);
      return {
        geojson: greatCircleArc(from, to),
        distanceNm: Math.round(nm),
        transitDays: round(nm / (AIR_SPEED_KN * 24)),
        passagesUsed: [],
        provenance: 'MODELED',
        note: 'Air mode: great-circle geodesic estimate.',
      };
    }

    // Hormuz no-bypass special case — surface the constraint, don't reroute.
    if (req.closedPassages.includes('hormuz') && GULF_PORTS.has(req.fromPortId)) {
      const hp = getChokepoint('hormuz');
      const nm = haversineNm(from, to);
      return {
        geojson: greatCircleArc(from, to),
        distanceNm: Math.round(nm),
        transitDays: round(nm / (vesselSpeed(req.vesselType) * 24)),
        passagesUsed: [],
        provenance: 'MODELED',
        constrained: true,
        note: hp?.note ?? 'No maritime bypass of Hormuz for Gulf crude.',
      };
    }

    try {
      const r = await computeSeaRoute(from, to, req.closedPassages, vesselSpeed(req.vesselType));
      const unsupported = unenforceablePassages(req.closedPassages);
      const notes: string[] = [];
      if (unsupported.length) {
        notes.push(`Closure(s) not modeled by the routing network: ${unsupported.join(', ')}.`);
      }
      if (r.snapKm > 250) {
        notes.push(`Snapped ${Math.round(r.snapKm)} km to the nearest shipping lane.`);
      }
      return {
        geojson: r.geojson,
        distanceNm: Math.round(r.distanceNm),
        transitDays: round(r.durationHours / 24),
        passagesUsed: r.passagesUsed,
        provenance: 'SOURCED',
        note: notes.length ? notes.join(' ') : undefined,
      };
    } catch (err) {
      if (!(await isRecoverableRouteError(err))) throw err;
      // No network path (e.g. all viable canals blocked) or snap failure → arc.
      const nm = haversineNm(from, to);
      return {
        geojson: greatCircleArc(from, to),
        distanceNm: Math.round(nm),
        transitDays: round(nm / (vesselSpeed(req.vesselType) * 24)),
        passagesUsed: [],
        provenance: 'MODELED',
        note: 'No network route under these closures; great-circle estimate.',
      };
    }
  }
}
