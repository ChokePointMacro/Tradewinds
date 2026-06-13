import type { CountryTradeBalance } from '@/types';

// Calls the serverless Comtrade proxy (/api/comtrade/*). The proxy holds the
// COMTRADE_API_KEY (server-only) and does cache-first reads. This client never
// sees secrets. Only net trade is Comtrade-backed today; production, reserves
// and port activity stay on seed data (handled by FlaggedSupplyDataSource).
export class LiveSupplyDataSource {
  async getNetTrade(commodityId: string): Promise<CountryTradeBalance[]> {
    const res = await fetch(
      `/api/comtrade/net-trade?commodity=${encodeURIComponent(commodityId)}`,
    );
    if (!res.ok) throw new Error(`comtrade proxy HTTP ${res.status}`);
    return (await res.json()) as CountryTradeBalance[];
  }
}
