import { describe, it, expect } from 'vitest';
import { paramMap } from './parameters';
import {
  estimateFreight,
  metalFreight,
  oilSeaFreight,
  WS_REFERENCE_NM,
} from './freight';

const oilParams = paramMap('crude_oil');
const goldParams = paramMap('gold');
const silverParams = paramMap('silver');

describe('oilSeaFreight', () => {
  it('at the reference distance equals WS rate + bunker', () => {
    // ws_flat 20 × pct 100/100 = 20, bunker 4 → 24 USD/bbl at 6000nm.
    const r = oilSeaFreight(WS_REFERENCE_NM, oilParams);
    expect(r.perUnit).toBeCloseTo(24, 6);
    expect(r.unit).toBe('bbl');
    expect(r.provenance).toBe('MODELED');
  });

  it('scales linearly with distance', () => {
    const base = oilSeaFreight(WS_REFERENCE_NM, oilParams).perUnit;
    const far = oilSeaFreight(WS_REFERENCE_NM * 2, oilParams).perUnit;
    expect(far).toBeCloseTo(base * 2, 6);
  });

  it('is zero at zero distance', () => {
    expect(oilSeaFreight(0, oilParams).perUnit).toBe(0);
  });

  it('breaks down into Worldscale + bunker components that sum to the total', () => {
    const r = oilSeaFreight(WS_REFERENCE_NM, oilParams);
    const sum = r.components.reduce((s, c) => s + c.value, 0);
    expect(sum).toBeCloseTo(r.perUnit, 6);
    expect(r.components.map((c) => c.label)).toEqual(['Worldscale freight', 'Bunker fuel']);
  });
});

describe('metalFreight', () => {
  it('gold = (secured_freight_pct + insurance_pct) of spot value', () => {
    // gold: 0.3% + 0.1% = 0.4% of 2000 = 8 USD/ozt.
    const r = metalFreight('gold', 2000, goldParams);
    expect(r.perUnit).toBeCloseTo(8, 6);
    expect(r.unit).toBe('ozt');
    expect(r.components).toHaveLength(2);
  });

  it('silver = freight_pct of spot value', () => {
    // silver: 0.4% of 30 = 0.12 USD/ozt.
    const r = metalFreight('silver', 30, silverParams);
    expect(r.perUnit).toBeCloseTo(0.12, 6);
    expect(r.components).toHaveLength(1);
  });

  it('scales with spot price, not distance', () => {
    const low = metalFreight('gold', 1000, goldParams).perUnit;
    const high = metalFreight('gold', 2000, goldParams).perUnit;
    expect(high).toBeCloseTo(low * 2, 6);
  });
});

describe('estimateFreight dispatcher', () => {
  it('routes crude_oil to the distance-scaled oil model', () => {
    const r = estimateFreight({ commodityId: 'crude_oil', distanceNm: WS_REFERENCE_NM });
    expect(r.perUnit).toBeCloseTo(24, 6);
  });

  it('routes gold to the value-based metal model', () => {
    const r = estimateFreight({ commodityId: 'gold', distanceNm: 5000, spotPrice: 2000 });
    expect(r.perUnit).toBeCloseTo(8, 6);
  });

  it('throws when a metal is missing its spot price', () => {
    expect(() => estimateFreight({ commodityId: 'gold', distanceNm: 5000 })).toThrow(/spot price/);
  });

  it('routes copper/nickel to the distance-scaled dry-bulk model ($/tonne)', () => {
    const r = estimateFreight({ commodityId: 'copper', distanceNm: 9000 });
    expect(r.unit).toBe('tonne');
    expect(r.perUnit).toBeCloseTo(40, 6); // base 40 × 9000/9000 reference
  });

  it('routes diesel to the distance-scaled Worldscale tanker model ($/bbl)', () => {
    const r = estimateFreight({ commodityId: 'diesel', distanceNm: 6000 });
    expect(r.unit).toBe('bbl');
    // ws 25 × 130% + bunker 5 = 32.5 + 5, scaled by 6000/6000 reference
    expect(r.perUnit).toBeCloseTo(37.5, 6);
  });

  it('routes palladium to the value-based metal model', () => {
    const r = estimateFreight({ commodityId: 'palladium', distanceNm: 5000, spotPrice: 1000 });
    // secured 0.3% + insurance 0.1% of 1000 = 4
    expect(r.perUnit).toBeCloseTo(4, 6);
  });

  it('throws for an unknown commodity', () => {
    expect(() => estimateFreight({ commodityId: 'unobtainium', distanceNm: 5000 })).toThrow(
      /No freight model/,
    );
  });
});
