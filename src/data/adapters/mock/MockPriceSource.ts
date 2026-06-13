import type { PricePoint, SpotQuote, Unit } from '@/types';
import type { PriceSource } from '../types';
import { getCommodity } from '@/data/commodities';
import { seededRng } from '@/lib/seededRandom';

// Deterministic seeded mock prices. Anchors are illustrative, NOT live.
const ANCHOR: Record<string, { price: number; unit: Unit; dailyVol: number }> = {
  crude_oil: { price: 86, unit: 'bbl', dailyVol: 0.018 },
  diesel: { price: 145, unit: 'bbl', dailyVol: 0.02 },
  gold: { price: 4200, unit: 'ozt', dailyVol: 0.009 },
  silver: { price: 67, unit: 'ozt', dailyVol: 0.016 },
  palladium: { price: 1290, unit: 'ozt', dailyVol: 0.02 },
  copper: { price: 14000, unit: 'tonne', dailyVol: 0.014 },
  nickel: { price: 16500, unit: 'tonne', dailyVol: 0.02 },
};

function unitFor(commodityId: string): Unit {
  return getCommodity(commodityId)?.nativeUnit ?? 'bbl';
}

export class MockPriceSource implements PriceSource {
  async getSpot(commodityId: string): Promise<SpotQuote> {
    const anchor = ANCHOR[commodityId];
    const base = anchor?.price ?? 100;
    const rng = seededRng(`spot:${commodityId}`);
    const jitter = (rng() - 0.5) * 0.02; // ±1%
    return {
      commodityId,
      price: round(base * (1 + jitter)),
      unit: anchor?.unit ?? unitFor(commodityId),
      currency: 'USD',
      asOfISO: new Date().toISOString(),
      source: 'MOCK',
    };
  }

  async getHistory(commodityId: string, fromISO: string, toISO: string): Promise<PricePoint[]> {
    const anchor = ANCHOR[commodityId];
    const base = anchor?.price ?? 100;
    const vol = anchor?.dailyVol ?? 0.015;
    const from = new Date(fromISO);
    const to = new Date(toISO);
    const rng = seededRng(`history:${commodityId}`);

    const points: PricePoint[] = [];
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000));
    let price = base * 0.85; // start below current and drift up
    const drift = (base - price) / days;
    for (let i = 0; i <= days; i++) {
      const d = new Date(from.getTime() + i * 86_400_000);
      const shock = (rng() - 0.5) * 2 * vol;
      price = Math.max(0.01, price + drift + price * shock);
      points.push({ dateISO: d.toISOString().slice(0, 10), close: round(price) });
    }
    return points;
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
