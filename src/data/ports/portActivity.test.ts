import { describe, it, expect } from 'vitest';
import { COMMODITIES } from '@/data/commodities';
import { portActivityFor } from './portActivity';

const ALL = COMMODITIES.flatMap((c) => portActivityFor(c.id));

describe('port-activity dataset', () => {
  it('covers every registered commodity', () => {
    for (const c of COMMODITIES) {
      expect(portActivityFor(c.id).length, `${c.id} should have ports`).toBeGreaterThan(0);
    }
  });

  it('tags every port with its own commodityId', () => {
    for (const c of COMMODITIES) {
      for (const p of portActivityFor(c.id)) expect(p.commodityId).toBe(c.id);
    }
  });

  it('has unique port ids within each commodity', () => {
    for (const c of COMMODITIES) {
      const ids = portActivityFor(c.id).map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('serves positive throughput with a unit and a real source citation', () => {
    for (const p of ALL) {
      expect(p.volume).toBeGreaterThan(0);
      expect(p.volumeUnit.length).toBeGreaterThan(0);
      expect(p.source).toBeTruthy();
      expect(p.sourceUrl?.startsWith('https://')).toBe(true);
    }
  });

  it('drops the modeled guess fields (declared value, cargo mix, partners)', () => {
    for (const p of ALL) {
      expect(p.valueDeclaredUsdB).toBeUndefined();
      expect(p.cargoMix).toBeUndefined();
      expect(p.partners).toBeUndefined();
    }
  });

  it('uses valid lat/lng coordinates', () => {
    for (const p of ALL) {
      expect(Math.abs(p.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(p.lng)).toBeLessThanOrEqual(180);
    }
  });
});
