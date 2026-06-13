import type { PricePoint, SpotQuote } from '@/types';
import type { PriceSource } from '../types';

// Calls the serverless price proxy (/api/price/*). The proxy holds the provider
// key (server-only) and does cache-first reads. This client never sees secrets.
export class LivePriceSource implements PriceSource {
  async getSpot(commodityId: string): Promise<SpotQuote> {
    const res = await fetch(`/api/price/spot?commodity=${encodeURIComponent(commodityId)}`);
    if (!res.ok) throw new Error(`spot proxy HTTP ${res.status}`);
    return (await res.json()) as SpotQuote;
  }

  async getHistory(commodityId: string, fromISO: string, toISO: string): Promise<PricePoint[]> {
    const qs = new URLSearchParams({ commodity: commodityId, from: fromISO, to: toISO });
    const res = await fetch(`/api/price/history?${qs.toString()}`);
    if (!res.ok) throw new Error(`history proxy HTTP ${res.status}`);
    return (await res.json()) as PricePoint[];
  }
}
