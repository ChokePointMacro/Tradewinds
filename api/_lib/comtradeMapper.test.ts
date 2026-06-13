import { describe, expect, it } from 'vitest';
import {
  COMTRADE_HS,
  hsCodeFor,
  isComtradeCommodity,
  mapItemProfile,
  mapNetTrade,
  mapTopPartners,
  reporterCodeFor,
} from './comtradeMapper';

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

  describe('reporterCodeFor', () => {
    it('resolves port countries (incl. Comtrade-specific codes) and aliases', () => {
      expect(reporterCodeFor('United States')).toBe(842);
      expect(reporterCodeFor('Norway')).toBe(579); // Comtrade variant, not 578
      expect(reporterCodeFor('France')).toBe(251); // Comtrade variant, not 250
      expect(reporterCodeFor('UAE')).toBe(784); // alias of United Arab Emirates
      expect(reporterCodeFor('South Korea')).toBe(410);
    });
    it('returns undefined for non-country region labels', () => {
      expect(reporterCodeFor('East Africa')).toBeUndefined();
      expect(reporterCodeFor('Europe')).toBeUndefined();
    });
  });

  describe('mapItemProfile', () => {
    it('computes export/import totals and export share', () => {
      const raw = {
        data: [
          { flowCode: 'X', primaryValue: 30e9, partnerCode: 0 },
          { flowCode: 'M', primaryValue: 10e9, partnerCode: 0 },
        ],
      };
      const p = mapItemProfile(raw, 2024)!;
      expect(p.exportUsdB).toBe(30);
      expect(p.importUsdB).toBe(10);
      expect(p.exportSharePct).toBe(75);
      expect(p.source).toBe('UN Comtrade');
    });
    it('returns null when there is no trade', () => {
      expect(mapItemProfile({ data: [] }, 2024)).toBeNull();
      expect(mapItemProfile({}, 2024)).toBeNull();
    });
  });

  describe('mapTopPartners', () => {
    const raw = {
      data: [
        { partnerDesc: 'China', partnerCode: 156, partnerISO: 'CHN', flowCode: 'X', primaryValue: 60e9 },
        { partnerDesc: 'India', partnerCode: 699, partnerISO: 'IND', flowCode: 'X', primaryValue: 40e9 },
        { partnerDesc: 'World', partnerCode: 0, flowCode: 'X', primaryValue: 100e9 },
        { partnerDesc: 'Japan', partnerCode: 392, flowCode: 'M', primaryValue: 20e9 },
      ],
    };
    it('ranks partners by value and computes per-flow shares, dropping World', () => {
      const rows = mapTopPartners(raw);
      const exports = rows.filter((r) => r.direction === 'export');
      expect(exports.map((r) => r.country)).toEqual(['China', 'India']);
      expect(exports[0]!.iso).toBe('CHN'); // ISO3 carried through for map lanes
      expect(exports[0]!.sharePct).toBe(60);
      expect(exports[1]!.sharePct).toBe(40);
      expect(rows.some((r) => r.country === 'World')).toBe(false);
      const imports = rows.filter((r) => r.direction === 'import');
      expect(imports).toHaveLength(1);
      expect(imports[0]!.country).toBe('Japan');
    });
    it('returns empty for malformed input', () => {
      expect(mapTopPartners({})).toEqual([]);
      expect(mapTopPartners({ data: 'nope' })).toEqual([]);
    });
  });
});
