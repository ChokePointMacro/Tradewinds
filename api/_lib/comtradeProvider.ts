// Server-only UN Comtrade client. Reads COMTRADE_API_KEY from the environment
// (never exposed to the client) and returns normalized net-trade rows via the
// pure comtradeMapper. The new Comtrade API (comtradeapi.un.org) requires a free
// subscription key passed in the Ocp-Apim-Subscription-Key header.
import {
  hsCodeFor,
  mapItemProfile,
  mapNetTrade,
  mapTopPartners,
  type ItemTradeProfile,
  type PartnerShareRow,
  type TradeBalanceRow,
} from './comtradeMapper';

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Comtrade's free tier rate-limits to ~1 request/second (HTTP 429). Retry a
// couple of times with a short backoff before giving up.
async function getJson(url: string, key: string, attempt = 0): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'User-Agent': 'Mozilla/5.0 (Tradewinds trade proxy)',
    },
  });
  if (res.status === 429 && attempt < 3) {
    await sleep(1200 * (attempt + 1));
    return getJson(url, key, attempt + 1);
  }
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

export interface PortTradeResult {
  profile: ItemTradeProfile | null;
  partners: PartnerShareRow[];
  year: number;
}

function profileUrl(hs: string, reporterCode: number, year: number): string {
  // One reporter vs World (partnerCode=0), both flows → export/import totals.
  const qs = new URLSearchParams({
    reporterCode: String(reporterCode),
    cmdCode: hs,
    flowCode: 'X,M',
    partnerCode: '0',
    period: String(year),
  });
  return `${COMTRADE_BASE}?${qs.toString()}`;
}

function partnersUrl(hs: string, reporterCode: number, year: number): string {
  // One reporter, all partners (partnerCode omitted), both flows → bilateral.
  const qs = new URLSearchParams({
    reporterCode: String(reporterCode),
    cmdCode: hs,
    flowCode: 'X,M',
    period: String(year),
  });
  return `${COMTRADE_BASE}?${qs.toString()}`;
}

/**
 * Fetch a port country's trade detail for a commodity: the export/import item
 * profile plus top partner countries (both flows). Tries TRADE_YEAR, then the
 * prior year if empty.
 */
export async function fetchPortTrade(
  commodityId: string,
  reporterCode: number,
): Promise<PortTradeResult> {
  const key = apiKey();
  const hs = hsCodeFor(commodityId);
  for (const year of [TRADE_YEAR, TRADE_YEAR - 1]) {
    // Serial, not parallel — the free tier rate-limits to ~1 req/sec.
    const profileRaw = await getJson(profileUrl(hs, reporterCode, year), key);
    const partnersRaw = await getJson(partnersUrl(hs, reporterCode, year), key);
    const profile = mapItemProfile(profileRaw, year);
    const partners = mapTopPartners(partnersRaw);
    if (profile || partners.length > 0) return { profile, partners, year };
  }
  return { profile: null, partners: [], year: TRADE_YEAR };
}
