import { describe, expect, it } from 'vitest';
import {
  MAGNET_CHAIN,
  MAGNET_ROUTES,
  totalMagnetCostUsdPerKg,
  midstreamCostSharePct,
} from './magnetChain';

describe('magnet supply chain', () => {
  it('stages are ordered 1..N with positive cost and a valid China share', () => {
    MAGNET_CHAIN.forEach((s, i) => {
      expect(s.order).toBe(i + 1);
      expect(s.costUsdPerKg).toBeGreaterThan(0);
      expect(s.chinaSharePct).toBeGreaterThanOrEqual(0);
      expect(s.chinaSharePct).toBeLessThanOrEqual(100);
      expect(s.dominantCompanies.length).toBeGreaterThan(0);
      expect(s.dominantCountries.length).toBeGreaterThan(0);
    });
  });

  it('models separation and magnet-making as the ~90% China chokepoints', () => {
    const sep = MAGNET_CHAIN.find((s) => s.id === 'separation')!;
    const mag = MAGNET_CHAIN.find((s) => s.id === 'magnet_making')!;
    expect(sep.chinaSharePct).toBeGreaterThanOrEqual(90);
    expect(mag.chinaSharePct).toBeGreaterThanOrEqual(90);
    expect(sep.exportControlled).toBe(true);
    expect(mag.exportControlled).toBe(true);
  });

  it('magnet-making is the single biggest cost adder (the value is in the magnet)', () => {
    const costs = MAGNET_CHAIN.map((s) => s.costUsdPerKg);
    const mag = MAGNET_CHAIN.find((s) => s.id === 'magnet_making')!;
    expect(mag.costUsdPerKg).toBe(Math.max(...costs));
  });

  it('exposes a representative total cost and a high midstream-capture share', () => {
    expect(totalMagnetCostUsdPerKg()).toBeGreaterThan(50);
    expect(midstreamCostSharePct()).toBeGreaterThan(80);
  });

  it('provides a dominant China route and an emerging Western route, each fully geocoded', () => {
    const dominant = MAGNET_ROUTES.filter((r) => r.dominant);
    expect(dominant).toHaveLength(1);
    expect(MAGNET_ROUTES.length).toBeGreaterThanOrEqual(2);
    for (const r of MAGNET_ROUTES) {
      expect(r.nodes.length).toBeGreaterThanOrEqual(3);
      for (const n of r.nodes) {
        expect(Math.abs(n.lng)).toBeLessThanOrEqual(180);
        expect(Math.abs(n.lat)).toBeLessThanOrEqual(90);
      }
    }
  });
});
