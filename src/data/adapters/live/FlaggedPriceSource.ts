import type { PricePoint, SpotQuote } from '@/types';
import type { PriceSource } from '../types';
import { isFeatureEnabled, track } from '@/lib/analytics';

const LIVE_FLAG = 'live-prices';

/**
 * Routes price reads to the live proxy when the `live-prices` flag is on, and
 * transparently falls back to mock data on any error (or when the flag is off),
 * so the UI always renders. The flag is re-checked per call because PostHog
 * flags resolve asynchronously after init.
 */
export class FlaggedPriceSource implements PriceSource {
  constructor(
    private readonly live: PriceSource,
    private readonly mock: PriceSource,
  ) {}

  private useLive(): boolean {
    return isFeatureEnabled(LIVE_FLAG);
  }

  async getSpot(commodityId: string): Promise<SpotQuote> {
    if (!this.useLive()) return this.mock.getSpot(commodityId);
    try {
      return await this.live.getSpot(commodityId);
    } catch (err) {
      track('live-prices-fallback', { kind: 'spot', commodityId, error: String(err) });
      return this.mock.getSpot(commodityId);
    }
  }

  async getHistory(commodityId: string, fromISO: string, toISO: string): Promise<PricePoint[]> {
    if (!this.useLive()) return this.mock.getHistory(commodityId, fromISO, toISO);
    try {
      return await this.live.getHistory(commodityId, fromISO, toISO);
    } catch (err) {
      track('live-prices-fallback', { kind: 'history', commodityId, error: String(err) });
      return this.mock.getHistory(commodityId, fromISO, toISO);
    }
  }
}
