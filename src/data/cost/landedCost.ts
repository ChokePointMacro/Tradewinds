import type { CostParameter, SupplyChainStep } from '@/types';

// Landed-cost build-up (PRD §13, Phase 3). Pure and deterministic: rolls the
// (user-editable, MODELED) cost parameters up the supply chain into a modeled
// $/unit landed cost, broken out per step. Always MODELED — this is a cost
// STRUCTURE estimate, never a sourced quote. The live spot price is compared
// against it in the UI to show the implied margin.

export interface StepCost {
  stepId: string;
  order: number;
  label: string;
  cost: number; // USD per native unit contributed by this step
}

export interface LandedCost {
  steps: StepCost[];
  total: number; // USD per native unit
  unit: string;
  provenance: 'MODELED';
}

// Modeled multipliers for configurable step options (refining location, vessel
// class, vault). Defaults to 1.0 for any option not listed. Illustrative only.
export const CONFIG_MULTIPLIER: Record<string, number> = {
  // Refining / smelting locations
  'US Gulf Coast': 1, Rotterdam: 1.05, Singapore: 1.03,
  Chile: 1, China: 0.9, DRC: 1.2, Indonesia: 0.95, Canada: 1.1,
  'South Africa': 1, Russia: 0.95, USA: 1.15,
  // Vessel classes
  VLCC: 0.9, Suezmax: 0.95, Aframax: 1, MR: 1, LR1: 0.95, LR2: 0.9,
  Handysize: 1.1, Supramax: 1, Panamax: 0.92,
  // Vault locations
  Zurich: 1, London: 1.02, 'New York': 1.05,
};

export function configMultiplier(option: string | undefined): number {
  if (!option) return 1;
  return CONFIG_MULTIPLIER[option] ?? 1;
}

/** Effective (possibly user-overridden) value for a parameter. */
function effective(
  key: string,
  params: Record<string, CostParameter>,
  overrides: Record<string, number>,
): number {
  return overrides[key] ?? params[key]?.value ?? 0;
}

/**
 * Contribution of a single non-freight parameter to $/unit cost.
 * - credits (key contains 'credit') subtract
 * - '% of value' params scale by the spot price (value-based logistics/insurance)
 * - knots / speed params are not costs → 0
 * - any other 'USD/...' param is additive at face value (storage /yr,/mo counted as one period)
 */
function contributionOf(
  key: string,
  unit: string,
  value: number,
  spotPrice: number | undefined,
): number {
  if (key.includes('speed') || unit.includes('knots')) return 0;
  if (key.includes('credit')) return -value;
  if (unit.includes('%')) return spotPrice != null ? (spotPrice * value) / 100 : 0;
  if (unit.startsWith('USD/')) return value;
  return 0;
}

/** Cost contributed by one chain step, including any configurable multiplier. */
export function stepCostOf(
  step: SupplyChainStep,
  params: Record<string, CostParameter>,
  overrides: Record<string, number>,
  selections: Record<string, string>,
  spotPrice: number | undefined,
): number {
  const keys = step.costParamKeys;
  let cost = 0;

  // Worldscale freight: flat × points/100, paired within the same step.
  const flatKey = keys.find((k) => k.endsWith('freight_ws_flat'));
  const pctKey = keys.find((k) => k.endsWith('freight_ws_pct'));
  if (flatKey) {
    const flat = effective(flatKey, params, overrides);
    const pct = pctKey ? effective(pctKey, params, overrides) : 100;
    cost += flat * (pct / 100);
  }

  for (const key of keys) {
    if (key === flatKey || key === pctKey) continue;
    const def = params[key];
    if (!def) continue;
    cost += contributionOf(key, def.unit, effective(key, params, overrides), spotPrice);
  }

  // Apply the configurable multiplier for this step (location / vessel select).
  // 'toggle' configurables are scenario flags only — no cost effect.
  const priced = (step.configurable ?? []).some((c) => c.type !== 'toggle');
  if (priced) cost *= configMultiplier(selections[step.id]);

  return Math.max(0, cost);
}

export function computeLandedCost(
  chain: SupplyChainStep[],
  params: Record<string, CostParameter>,
  overrides: Record<string, number>,
  selections: Record<string, string>,
  unit: string,
  spotPrice?: number,
): LandedCost {
  const steps: StepCost[] = chain.map((step) => ({
    stepId: step.id,
    order: step.order,
    label: step.label,
    cost: stepCostOf(step, params, overrides, selections, spotPrice),
  }));
  const total = steps.reduce((sum, s) => sum + s.cost, 0);
  return { steps, total, unit, provenance: 'MODELED' };
}
