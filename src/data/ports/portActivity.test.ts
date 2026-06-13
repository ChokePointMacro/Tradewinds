import { describe, it, expect } from 'vitest';
import { COMMODITIES } from '@/data/commodities';
import { PORT_ACTIVITY, portActivityFor } from './portActivity';

const ALL = Object.values(PORT_ACTIVITY).flat();

describe('port-activity seed data', () => {
  it('covers every registered commodity', () => {
    for (const c of COMMODITIES) {
      expect(portActivityFor(c.id).length, `${c.id} should have ports`).toBeGreaterThan(0);
    }
  });

  it('tags every port with its own commodityId', () => {
    for (const [commodityId, ports] of Object.entries(PORT_ACTIVITY)) {
      for (const p of ports) expect(p.commodityId).toBe(commodityId);
    }
  });

  it('has unique port ids within each commodity', () => {
    for (const ports of Object.values(PORT_ACTIVITY)) {
      const ids = ports.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('uses positive throughput and declared value', () => {
    for (const p of ALL) {
      expect(p.volume).toBeGreaterThan(0);
      expect(p.valueDeclaredUsdB).toBeGreaterThan(0);
      expect(p.volumeUnit.length).toBeGreaterThan(0);
    }
  });

  it('cargo-mix shares sum to ~100% per port', () => {
    for (const p of ALL) {
      const sum = p.cargoMix.reduce((s, c) => s + c.sharePct, 0);
      expect(sum, `${p.id} cargo mix`).toBeCloseTo(100, 0);
    }
  });

  it('lists 3+ trading partners with sane shares', () => {
    for (const p of ALL) {
      expect(p.partners.length).toBeGreaterThanOrEqual(3);
      const total = p.partners.reduce((s, x) => s + x.sharePct, 0);
      expect(total).toBeGreaterThan(0);
      expect(total).toBeLessThanOrEqual(100);
      for (const partner of p.partners) {
        expect(['export', 'import']).toContain(partner.direction);
      }
    }
  });

  it('uses valid lat/lng coordinates', () => {
    for (const p of ALL) {
      expect(Math.abs(p.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(p.lng)).toBeLessThanOrEqual(180);
    }
  });
});
