import { describe, expect, it } from 'vitest';
import { haversineNm, kmToNm } from './geo';
import { getPort } from '@/data/geo/ports';

describe('geo', () => {
  it('converts km to nautical miles', () => {
    expect(kmToNm(1.852)).toBeCloseTo(1, 5);
  });

  it('computes a sane great-circle distance between two ports', () => {
    const from = getPort('ras_tanura')!;
    const to = getPort('houston')!;
    const nm = haversineNm(from, to);
    // Great-circle (straight-line) Gulf → Houston is ~6,900 nm. The real sea
    // route is longer; that distinction lands with searoute in Phase 2.
    expect(nm).toBeGreaterThan(6000);
    expect(nm).toBeLessThan(8000);
  });
});
