import { describe, expect, it } from 'vitest';
import { forecast, logReturns, mean, stdev } from './forecast';
import type { PricePoint } from '@/types';

function series(closes: number[]): PricePoint[] {
  return closes.map((close, i) => ({
    dateISO: new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10),
    close,
  }));
}

describe('forecast math', () => {
  it('computes log returns', () => {
    const r = logReturns(series([100, 110, 99]));
    expect(r).toHaveLength(2);
    expect(r[0]!).toBeCloseTo(Math.log(110 / 100), 10);
    expect(r[1]!).toBeCloseTo(Math.log(99 / 110), 10);
  });

  it('mean and stdev behave', () => {
    expect(mean([1, 2, 3])).toBeCloseTo(2, 10);
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2);
  });

  it('flat history yields ~flat median and zero-width bands', () => {
    const f = forecast(series(Array(30).fill(50)), 10);
    expect(f.assumptions.sigmaDaily).toBeCloseTo(0, 10);
    const p = f.points[f.points.length - 1]!;
    expect(p.median).toBeCloseTo(50, 6);
    expect(p.lo95).toBeCloseTo(50, 6);
    expect(p.hi95).toBeCloseTo(50, 6);
  });

  it('bands widen with horizon and are nested 80% inside 95%', () => {
    // alternating series gives non-zero volatility
    const closes = Array.from({ length: 60 }, (_, i) => 100 + (i % 2 === 0 ? 3 : -3));
    const f = forecast(series(closes), 30);
    const first = f.points[0]!;
    const lastP = f.points[f.points.length - 1]!;
    const width = (p: typeof first) => p.hi95 - p.lo95;
    expect(width(lastP)).toBeGreaterThan(width(first));
    // 80% band sits inside 95% band
    expect(first.lo80).toBeGreaterThan(first.lo95);
    expect(first.hi80).toBeLessThan(first.hi95);
  });

  it('produces horizonDays forecast points starting after the last history date', () => {
    const f = forecast(series([10, 11, 12]), 5);
    expect(f.points).toHaveLength(5);
    expect(f.points[0]!.dateISO > '2025-01-03').toBe(true);
  });
});
