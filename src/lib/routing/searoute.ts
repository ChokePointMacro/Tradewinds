import type { Feature, LineString } from 'geojson';
import type { Passage } from 'searoute-ts';
import type { Port } from '@/types';

// Thin wrapper over searoute-ts (Eurostat marnet, canal/strait restrictions).
// The library bundles a ~2 MB maritime network, so it is loaded on demand via
// dynamic import — it lands in its own chunk and never bloats initial page load.

// Our chokepoint passageKeys → searoute Passage names. `taiwan` has no label in
// the Eurostat network and no bbox fallback, so it cannot be enforced (null).
const PASSAGE_MAP: Record<string, Passage | null> = {
  hormuz: 'ormuz',
  suez: 'suez',
  bab_el_mandeb: 'babelmandeb',
  panama: 'panama',
  malacca: 'malacca',
  gibraltar: 'gibraltar',
  taiwan: null,
};

/** passageKeys we can actually enforce as searoute restrictions. */
export function enforceablePassages(closedPassageKeys: string[]): Passage[] {
  return closedPassageKeys.map((k) => PASSAGE_MAP[k]).filter((p): p is Passage => p != null);
}

/** passageKeys the engine cannot model (toggled but unsupported). */
export function unenforceablePassages(closedPassageKeys: string[]): string[] {
  return closedPassageKeys.filter((k) => PASSAGE_MAP[k] === null);
}

export interface SeaRouteResult {
  geojson: Feature<LineString>;
  distanceNm: number;
  durationHours: number;
  passagesUsed: string[];
  detourRatio: number;
  snapKm: number;
}

type SearouteModule = typeof import('searoute-ts');
let modPromise: Promise<SearouteModule> | null = null;
function loadSearoute(): Promise<SearouteModule> {
  if (!modPromise) modPromise = import('searoute-ts');
  return modPromise;
}

/**
 * Compute a canal/strait-aware maritime route. Throws SnapFailedError /
 * NoRouteError (re-exported by searoute-ts) when the ports can't be snapped or
 * no path exists under the given restrictions — callers fall back to an arc.
 */
export async function computeSeaRoute(
  from: Port,
  to: Port,
  closedPassageKeys: string[],
  speedKnots: number,
): Promise<SeaRouteResult> {
  const { seaRoute } = await loadSearoute();
  const feature = seaRoute([from.lng, from.lat], [to.lng, to.lat], {
    units: 'nauticalmiles',
    restrictions: enforceablePassages(closedPassageKeys),
    speedKnots,
    returnPassages: true,
    appendOriginDestination: true,
    maxSnapDistanceKm: 1500,
  });
  const p = feature.properties;
  return {
    geojson: feature as Feature<LineString>,
    distanceNm: p.length,
    durationHours: p.durationHours ?? 0,
    passagesUsed: p.passages ?? [],
    detourRatio: p.detourRatio,
    snapKm: Math.max(p.originSnapKm, p.destinationSnapKm),
  };
}

/** True when the searoute error is one of its expected, recoverable failures. */
export async function isRecoverableRouteError(err: unknown): Promise<boolean> {
  const { SnapFailedError, NoRouteError } = await loadSearoute();
  return err instanceof SnapFailedError || err instanceof NoRouteError;
}
