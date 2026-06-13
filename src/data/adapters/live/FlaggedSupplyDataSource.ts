import type {
  CommodityPortActivity,
  CountryProduction,
  CountryReserves,
  CountryTradeBalance,
} from '@/types';
import type { SupplyDataSource } from '../types';
import type { LiveSupplyDataSource } from './LiveSupplyDataSource';
import { isFeatureEnabled, track } from '@/lib/analytics';

const LIVE_FLAG = 'live-trade';

/**
 * Routes net-trade reads to the live UN Comtrade proxy when the `live-trade`
 * flag is on, and transparently falls back to MODELED seed data on any error
 * (or when the flag is off, or when the proxy returns no rows). Production,
 * reserves and port activity have no live source yet, so they always come from
 * the mock seed. The flag is re-checked per call because PostHog flags resolve
 * asynchronously after init.
 */
export class FlaggedSupplyDataSource implements SupplyDataSource {
  constructor(
    private readonly live: LiveSupplyDataSource,
    private readonly mock: SupplyDataSource,
  ) {}

  getProductionByCountry(commodityId: string): Promise<CountryProduction[]> {
    return this.mock.getProductionByCountry(commodityId);
  }

  getReserves(commodityId: string): Promise<CountryReserves[]> {
    return this.mock.getReserves(commodityId);
  }

  getPortActivity(commodityId: string): Promise<CommodityPortActivity[]> {
    return this.mock.getPortActivity(commodityId);
  }

  async getNetTrade(commodityId: string): Promise<CountryTradeBalance[]> {
    if (!isFeatureEnabled(LIVE_FLAG)) return this.mock.getNetTrade(commodityId);
    try {
      const rows = await this.live.getNetTrade(commodityId);
      if (rows.length === 0) return this.mock.getNetTrade(commodityId);
      return rows;
    } catch (err) {
      track('live-trade-fallback', { commodityId, error: String(err) });
      return this.mock.getNetTrade(commodityId);
    }
  }
}
