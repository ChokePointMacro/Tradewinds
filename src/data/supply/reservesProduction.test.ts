import { describe, expect, it } from 'vitest';
import { productionFor, reservesFor, PRODUCTION_RESERVES_ASOF } from './reservesProduction';

const COMMODITIES = ['crude_oil', 'diesel', 'gold', 'silver', 'copper', 'nickel', 'palladium'];

describe('production & reserves dataset', () => {
  it('returns production rows for every commodity, each fully attributed', () => {
    for (const id of COMMODITIES) {
      const rows = productionFor(id);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) {
        expect(r.country).toBeTruthy();
        expect(r.amount).toBeGreaterThan(0);
        expect(r.unit).toBeTruthy();
        expect(r.year).toBe(PRODUCTION_RESERVES_ASOF);
        expect(r.source).toBeTruthy();
        expect(r.sourceUrl?.startsWith('https://')).toBe(true);
      }
    }
  });

  it('attributes metals to USGS and oil/diesel to EIA', () => {
    expect(productionFor('gold')[0]!.source).toMatch(/USGS/);
    expect(productionFor('copper')[0]!.source).toMatch(/USGS/);
    expect(productionFor('crude_oil')[0]!.source).toMatch(/EIA/);
    expect(productionFor('diesel')[0]!.source).toMatch(/EIA/);
  });

  it('returns attributed reserves rows where reserves are published', () => {
    for (const id of ['crude_oil', 'gold', 'silver', 'copper', 'nickel', 'palladium']) {
      const rows = reservesFor(id);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) {
        expect(r.amount).toBeGreaterThan(0);
        expect(r.source).toBeTruthy();
        expect(r.sourceUrl?.startsWith('https://')).toBe(true);
      }
    }
  });

  it('returns an empty array for an unknown commodity (no fabrication)', () => {
    expect(productionFor('unobtainium')).toEqual([]);
    expect(reservesFor('unobtainium')).toEqual([]);
  });
});
