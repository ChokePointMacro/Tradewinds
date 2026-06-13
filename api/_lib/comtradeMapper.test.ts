import { describe, expect, it } from 'vitest';
import { COMTRADE_HS, hsCodeFor, isComtradeCommodity, mapNetTrade } from './comtradeMapper';

// Minimal Comtrade `get` row shape (partner=World, one HS code, one year).
function row(reporterDesc: string, flowCode: 'X' | 'M', primaryValue: number, reporterCode = 1) {
  return { reporterDesc, reporterCode, flowCode, primaryValue, partnerCode: 0 };
}

describe('comtradeMapper', () => {
  it('maps every app commodity to an HS code', () => {
    for (const id of ['crude_oil', 'diesel', 'gold', 'silver', 'copper', 'nickel', 'palladium']) {
      expect(isComtradeCommodity(id)).toBe(true);
      expect(hsCodeFor(id)).toBe(COMTRADE_HS[id].code);
    }
    expect(isComtradeCommodity('platinum')).toBe(false);
    expect(() => hsCodeFor('platinum')).toThrow();
  });

  it('nets exports minus imports per reporter, in USD billions', () => {
    const raw = {
      data: [
        row('Saudi Arabia', 'X', 200e9, 682),
        row('Saudi Arabia', 'M', 5e9, 682),
        row('United States', 'X', 80e9, 842),
        row('United States', 'M', 120e9, 842),
      ],
    };
    const out = mapNetTrade('crude_oil', raw, 2024);
    const sa = out.find((r) => r.country === 'Saudi Arabia');
    const us = out.find((r) => r.country === 'United States');
    expect(sa?.netExport).toBeCloseTo(195, 2); // (200-5) bn
    expect(us?.netExport).toBeCloseTo(-40, 2); // (80-120) bn
    expect(sa?.unit).toBe('$B/yr');
    expect(sa?.provenance).toBe('SOURCED');
    expect(sa?.source).toBe('UN Comtrade');
    expect(sa?.year).toBe(2024);
  });

  it('drops World and aggregate reporters', () => {
    const raw = {
      data: [
        { reporterDesc: 'World', reporterCode: 0, flowCode: 'X', primaryValue: 999e9 },
        row('EU-27', 'X', 50e9, 97),
        row('Chile', 'X', 30e9, 152),
      ],
    };
    const out = mapNetTrade('copper', raw, 2024);
    expect(out.map((r) => r.country)).toEqual(['Chile']);
  });

  it('returns top exporters first, then deepest importers', () => {
    const raw = {
      data: [
        row('A', 'X', 100e9, 1),
        row('B', 'X', 90e9, 2),
        row('C', 'X', 80e9, 3),
        row('D', 'M', 70e9, 4), // net importer −70
        row('E', 'M', 60e9, 5), // net importer −60
      ],
    };
    const out = mapNetTrade('gold', raw, 2024, { topExporters: 2, topImporters: 1 });
    // Two biggest exporters then the single deepest importer.
    expect(out.map((r) => r.country)).toEqual(['A', 'B', 'D']);
    expect(out[0]!.netExport).toBeGreaterThan(0);
    expect(out[out.length - 1]!.netExport).toBeLessThan(0);
  });

  it('handles missing/empty data without throwing', () => {
    expect(mapNetTrade('gold', {}, 2024)).toEqual([]);
    expect(mapNetTrade('gold', { data: [] }, 2024)).toEqual([]);
    expect(mapNetTrade('gold', { data: 'nope' }, 2024)).toEqual([]);
  });
});
