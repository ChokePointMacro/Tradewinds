// Server-only UN Comtrade client. Reads COMTRADE_API_KEY from the environment
// (never exposed to the client) and returns normalized net-trade rows via the
// pure comtradeMapper. The new Comtrade API (comtradeapi.un.org) requires a free
// subscription key passed in the Ocp-Apim-Subscription-Key header.
import { hsCodeFor, mapNetTrade, type TradeBalanceRow } from './comtradeMapper';

const COMTRADE_BASE = 'https://comtradeapi.un.org/data/v1/get/C/A/HS';

// Annual Comtrade data lags ~1 year; default to the latest fully-reported year
// and fall back one year if it returns nothing.
export const TRADE_YEAR = 2024;

export class ComtradeUnconfiguredError extends Error {}

function apiKey(): string {
  const key = process.env.COMTRADE_API_KEY;
  if (!key) throw new ComtradeUnconfiguredError('COMTRADE_API_KEY is not set');
  return key;
}

async function getJson(url: string, key: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'User-Agent': 'Mozilla/5.0 (Tradewinds trade proxy)',
    },
  });
  if (!res.ok) throw new Error(`Comtrade HTTP ${res.status}`);
  return res.json();
}

function buildUrl(hs: string, year: number): string {
  // reporterCode omitted = all reporters; partnerCode=0 = World; flows X+M.
  const qs = new URLSearchParams({
    cmdCode: hs,
    flowCode: 'X,M',
    partnerCode: '0',
    period: String(year),
  });
  return `${COMTRADE_BASE}?${qs.toString()}`;
}

/**
 * Fetch per-country net trade for a commodity, in USD billions/year (SOURCED).
 * Tries TRADE_YEAR, then TRADE_YEAR-1 if the first year reports no rows.
 */
export async function fetchNetTrade(commodityId: string): Promise<TradeBalanceRow[]> {
  const key = apiKey();
  const hs = hsCodeFor(commodityId);
  for (const year of [TRADE_YEAR, TRADE_YEAR - 1]) {
    const raw = await getJson(buildUrl(hs, year), key);
    const rows = mapNetTrade(commodityId, raw, year);
    if (rows.length > 0) return rows;
  }
  return [];
}
