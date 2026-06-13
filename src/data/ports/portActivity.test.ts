import { describe, it, expect } from 'vitest';
import { portActivityFor } from './portActivity';

// Commodities with seeded port throughput. Newer commodities (rare earths, food)
// have no free port dataset yet and intentionally return [] (source-or-error).
const PORT_COMMODITIES = ['crude_oil', 'diesel', 'gold', 'silver', 'palladium', 'copper', 'nickel'];
const ALL = PORT_COMMODITIES.flatMap((id) => portActivityFor(id));

describe('port-activity dataset', () => {
  it('covers the seeded commodities', () => {
    for (const id of PORT_COMMODITIES) {
      expect(portActivityFor(id).length, `${id} should have ports`).toBeGreaterThan(0);
    }
  });

  it('tags every port with its own commodityId', () => {
    for (const id of PORT_COMMODITIES) {
      for (const p of portActivityFor(id)) expect(p.commodityId).toBe(id);
    }
  });

  it('has unique port ids within each commodity', () => {
    for (const id of PORT_COMMODITIES) {
      const ids = portActivityFor(id).map((p) => p.id);
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
