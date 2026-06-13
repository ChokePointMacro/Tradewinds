import { describe, it, expect } from 'vitest';
import { oilChain } from '../commodities/oil';
import { goldChain } from '../commodities/gold';
import { paramMap } from './parameters';
import {
  computeLandedCost,
  stepCostOf,
  configMultiplier,
} from './landedCost';

const oilParams = paramMap('crude_oil');
const goldParams = paramMap('gold');

describe('configMultiplier', () => {
  it('defaults to 1 for unknown or missing options', () => {
    expect(configMultiplier(undefined)).toBe(1);
    expect(configMultiplier('Switzerland')).toBe(1); // not in the table
  });

  it('returns the modeled multiplier for known options', () => {
    expect(configMultiplier('VLCC')).toBe(0.9);
    expect(configMultiplier('Rotterdam')).toBe(1.05);
    expect(configMultiplier('London')).toBe(1.02);
  });
});

describe('stepCostOf — crude oil steps', () => {
  it('treats a plain USD/bbl param as additive', () => {
    const explore = oilChain.find((s) => s.id === 'oil_explore')!;
    expect(stepCostOf(explore, oilParams, {}, {}, undefined)).toBeCloseTo(3, 6);
  });

  it('pairs Worldscale flat × pct and adds bunker, excluding the speed param', () => {
    const marine = oilChain.find((s) => s.id === 'oil_marine')!;
    // ws_flat 20 × (pct 100/100) = 20, bunker 4, speed 13kn → 0; no selection → ×1.
    expect(stepCostOf(marine, oilParams, {}, {}, undefined)).toBeCloseTo(24, 6);
  });

  it('applies the vessel-class multiplier when that step is selected', () => {
    const marine = oilChain.find((s) => s.id === 'oil_marine')!;
    // 24 × VLCC 0.9 = 21.6
    expect(stepCostOf(marine, oilParams, {}, { oil_marine: 'VLCC' }, undefined)).toBeCloseTo(21.6, 6);
  });

  it('does not apply a multiplier for toggle-only configurable steps', () => {
    const storage = oilChain.find((s) => s.id === 'oil_storage')!;
    // storage_cost 0.5; toggles are scenario flags only → no cost effect.
    expect(stepCostOf(storage, oilParams, {}, { oil_storage: 'on' }, undefined)).toBeCloseTo(0.5, 6);
  });

  it('honors an override over the seed value', () => {
    const extraction = oilChain.find((s) => s.id === 'oil_extraction')!;
    expect(stepCostOf(extraction, oilParams, { 'oil.lifting_cost': 20 }, {}, undefined)).toBeCloseTo(20, 6);
  });
});

describe('computeLandedCost — crude oil', () => {
  it('rolls every step into a MODELED total (no selections)', () => {
    const lc = computeLandedCost(oilChain, oilParams, {}, {}, 'bbl', 86);
    // 3 + 5 + 8 + 2 + 24 + 12 + 0.5 = 54.5
    expect(lc.total).toBeCloseTo(54.5, 6);
    expect(lc.unit).toBe('bbl');
    expect(lc.provenance).toBe('MODELED');
    expect(lc.steps).toHaveLength(oilChain.length);
    expect(lc.steps.reduce((s, x) => s + x.cost, 0)).toBeCloseTo(lc.total, 6);
  });

  it('applies vessel + refining selections to the total', () => {
    const lc = computeLandedCost(
      oilChain,
      oilParams,
      {},
      { oil_marine: 'VLCC', oil_refining: 'US Gulf Coast' },
      'bbl',
      86,
    );
    // marine 24×0.9=21.6, refining 12×1=12 → 3+5+8+2+21.6+12+0.5 = 52.1
    expect(lc.total).toBeCloseTo(52.1, 6);
  });

  it('preserves chain order and labels in the breakdown', () => {
    const lc = computeLandedCost(oilChain, oilParams, {}, {}, 'bbl', 86);
    expect(lc.steps.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(lc.steps[0]!.label).toBe('Exploration / Prospecting');
  });
});

describe('computeLandedCost — gold (value-based logistics)', () => {
  it('scales %-of-value params by the spot price', () => {
    const spot = 4000;
    const lc = computeLandedCost(goldChain, goldParams, {}, {}, 'ozt', spot);
    // explore 60 + minebuild 150 + extraction 0 + aisc 1350 + refining 5
    // + fabrication 35 + logistics(secured 0.3%×4000=12, insurance 0.1%×4000=4, vault 12 = 28)
    // = 1628
    expect(lc.total).toBeCloseTo(1628, 6);
  });

  it('omits value-based logistics when no spot price is supplied', () => {
    const lc = computeLandedCost(goldChain, goldParams, {}, {}, 'ozt', undefined);
    // logistics drops the two %-of-value lines → only vault 12 remains.
    // 60 + 150 + 0 + 1350 + 5 + 35 + 12 = 1612
    expect(lc.total).toBeCloseTo(1612, 6);
  });

  it('applies the vault location multiplier', () => {
    const lc = computeLandedCost(goldChain, goldParams, {}, { gold_logistics: 'London' }, 'ozt', 4000);
    // logistics 28 × London 1.02 = 28.56 → 1628 - 28 + 28.56 = 1628.56
    expect(lc.total).toBeCloseTo(1628.56, 6);
  });
});
