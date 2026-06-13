import type { CostParameter, Provenance, Unit } from '@/types';
import { paramMap } from './parameters';

// Freight cost model (PRD §12.3). Pure, deterministic, composed in the tab layer
// from a route's distance + the (MODELED, user-editable) cost parameters and, for
// value-based cargoes, the live spot price. Always MODELED — freight here is a
// cost STRUCTURE estimate, never a sourced market quote.

export interface FreightComponent {
  label: string;
  value: number; // USD per native unit
}

export interface FreightEstimate {
  perUnit: number; // USD per native unit (bbl or ozt)
  unit: Unit;
  provenance: Provenance; // always MODELED
  components: FreightComponent[];
  note: string;
}

// The Worldscale flat rate is quoted for a reference voyage; we scale linearly by
// the actual route distance so a Cape-of-Good-Hope detour costs more than a Suez
// transit. 6,000 nm ≈ a typical laden VLCC long-haul leg (Gulf→NW Europe via Suez).
export const WS_REFERENCE_NM = 6000;

function num(params: Record<string, CostParameter>, key: string): number {
  return params[key]?.value ?? 0;
}

/**
 * Worldscale tanker freight in USD/bbl. Worldscale rate (flat × points/100) plus a
 * bunker-fuel component, both scaled linearly by distance against the WS
 * reference voyage. Distance scaling is what makes a reroute show a higher cost.
 * Used for crude oil and refined products (diesel) via a cost-key prefix.
 */
export function tankerFreight(
  prefix: 'oil' | 'diesel',
  distanceNm: number,
  params: Record<string, CostParameter>,
): FreightEstimate {
  const wsBase =
    num(params, `${prefix}.freight_ws_flat`) * (num(params, `${prefix}.freight_ws_pct`) / 100);
  const bunker = num(params, `${prefix}.bunker_cost`);
  const scale = distanceNm / WS_REFERENCE_NM;
  const wsScaled = wsBase * scale;
  const bunkerScaled = bunker * scale;
  return {
    perUnit: wsScaled + bunkerScaled,
    unit: 'bbl',
    provenance: 'MODELED',
    components: [
      { label: 'Worldscale freight', value: wsScaled },
      { label: 'Bunker fuel', value: bunkerScaled },
    ],
    note: `Worldscale × distance/${WS_REFERENCE_NM}nm reference.`,
  };
}

export function oilSeaFreight(
  distanceNm: number,
  params: Record<string, CostParameter>,
): FreightEstimate {
  return tankerFreight('oil', distanceNm, params);
}

// A loaded bulk carrier long-haul leg (e.g. Chile→China) is roughly this far; the
// per-tonne bulk rate is quoted for such a voyage and scaled linearly by distance.
export const BULK_REFERENCE_NM = 9000;

/**
 * Base-metal (copper/nickel) ocean freight in USD/tonne. Single dry-bulk rate
 * scaled linearly by distance against the bulk reference voyage.
 */
export function bulkMetalFreight(
  commodityId: 'copper' | 'nickel',
  distanceNm: number,
  params: Record<string, CostParameter>,
): FreightEstimate {
  const base = num(params, `${commodityId}.bulk_freight`);
  const scaled = base * (distanceNm / BULK_REFERENCE_NM);
  return {
    perUnit: scaled,
    unit: 'tonne',
    provenance: 'MODELED',
    components: [{ label: 'Dry-bulk ocean freight', value: scaled }],
    note: `Dry-bulk $/tonne × distance/${BULK_REFERENCE_NM}nm reference.`,
  };
}

/**
 * Precious-metal freight in USD/ozt, quoted as a percentage of cargo value
 * (secured logistics + transit insurance) — the industry convention, so it does
 * not scale with distance. Gold splits freight/insurance; silver uses one combined
 * freight percentage.
 */
export function metalFreight(
  commodityId: 'gold' | 'silver' | 'palladium',
  spotPrice: number,
  params: Record<string, CostParameter>,
): FreightEstimate {
  const components: FreightComponent[] = [];
  if (commodityId === 'gold' || commodityId === 'palladium') {
    const freight = spotPrice * (num(params, `${commodityId}.secured_freight_pct`) / 100);
    const insurance = spotPrice * (num(params, `${commodityId}.insurance_pct`) / 100);
    components.push({ label: 'Secured air freight', value: freight });
    components.push({ label: 'Transit insurance', value: insurance });
  } else {
    const freight = spotPrice * (num(params, 'silver.freight_pct') / 100);
    components.push({ label: 'Secured freight', value: freight });
  }
  const perUnit = components.reduce((sum, c) => sum + c.value, 0);
  return {
    perUnit,
    unit: 'ozt',
    provenance: 'MODELED',
    components,
    note: '% of cargo value (secured logistics + insurance).',
  };
}

export interface FreightInput {
  commodityId: string;
  distanceNm: number;
  spotPrice?: number; // required for value-based metal freight
}

/**
 * Dispatch to the right freight model for a commodity. Crude oil → distance-scaled
 * Worldscale ($/bbl); gold/silver → value-based ($/ozt, needs spotPrice). Throws if
 * a value-based commodity is missing its spot price.
 */
export function estimateFreight(input: FreightInput): FreightEstimate {
  const params = paramMap(input.commodityId);
  if (input.commodityId === 'crude_oil') {
    return tankerFreight('oil', input.distanceNm, params);
  }
  if (input.commodityId === 'diesel') {
    return tankerFreight('diesel', input.distanceNm, params);
  }
  if (input.commodityId === 'copper' || input.commodityId === 'nickel') {
    return bulkMetalFreight(input.commodityId, input.distanceNm, params);
  }
  if (
    input.commodityId === 'gold' ||
    input.commodityId === 'silver' ||
    input.commodityId === 'palladium'
  ) {
    if (input.spotPrice == null) {
      throw new Error(`Value-based freight for ${input.commodityId} requires a spot price.`);
    }
    return metalFreight(input.commodityId, input.spotPrice, params);
  }
  throw new Error(`No freight model for commodity: ${input.commodityId}`);
}
