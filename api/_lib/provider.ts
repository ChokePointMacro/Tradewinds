// Server-only price provider client. Reads PRICE_API_KEY / PRICE_API_PROVIDER
// from the environment (never exposed to the client) and returns normalized
// shapes via the pure priceMapper.
import {
  mapHistory,
  mapSpot,
  mapYahooHistory,
  mapYahooSpot,
  symbolFor,
  yahooSymbolFor,
  type NormalizedPoint,
  type NormalizedSpot,
  type ProviderId,
} from './priceMapper';

const PROVIDER_BASE: Record<ProviderId, string> = {
  yahoo: 'https://query1.finance.yahoo.com/v8/finance/chart',
  commoditypriceapi: 'https://api.commoditypriceapi.com/v2',
  metalpriceapi: 'https://api.metalpriceapi.com/v1',
  oilpriceapi: 'https://api.oilpriceapi.com/v1',
  apininjas: 'https://api.api-ninjas.com/v1',
};

export class ProviderUnconfiguredError extends Error {}

// Yahoo Finance is the keyless default so live prices work with zero secrets;
// the rates-map providers require PRICE_API_KEY.
function config(): { provider: ProviderId; apiKey: string } {
  const provider = (process.env.PRICE_API_PROVIDER ?? 'yahoo') as ProviderId;
  if (!(provider in PROVIDER_BASE)) throw new Error(`Unsupported PRICE_API_PROVIDER: ${provider}`);
  if (provider === 'yahoo') return { provider, apiKey: '' };
  const apiKey = process.env.PRICE_API_KEY;
  if (!apiKey) throw new ProviderUnconfiguredError('PRICE_API_KEY is not set');
  return { provider, apiKey };
}

async function getJson(url: string, apiKey: string): Promise<unknown> {
  const headers: Record<string, string> = { 'User-Agent': 'Mozilla/5.0 (Tradewinds price proxy)' };
  if (apiKey) headers['x-api-key'] = apiKey;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Provider HTTP ${res.status} for ${new URL(url).pathname}`);
  }
  return res.json();
}

export async function fetchSpot(commodityId: string): Promise<NormalizedSpot> {
  const { provider, apiKey } = config();
  if (provider === 'yahoo') {
    const url = `${PROVIDER_BASE.yahoo}/${encodeURIComponent(yahooSymbolFor(commodityId))}?interval=1d&range=1d`;
    return mapYahooSpot(commodityId, await getJson(url, ''), new Date().toISOString());
  }
  const symbol = symbolFor(commodityId);
  const url = `${PROVIDER_BASE[provider]}/latest?symbols=${encodeURIComponent(symbol)}&base=USD&apiKey=${encodeURIComponent(apiKey)}`;
  const raw = await getJson(url, apiKey);
  return mapSpot(commodityId, raw, provider, new Date().toISOString());
}

export async function fetchHistory(
  commodityId: string,
  fromISO: string,
  toISO: string,
): Promise<NormalizedPoint[]> {
  const { provider, apiKey } = config();
  if (provider === 'yahoo') {
    const p1 = Math.floor(new Date(`${fromISO}T00:00:00Z`).getTime() / 1000);
    const p2 = Math.floor(new Date(`${toISO}T23:59:59Z`).getTime() / 1000);
    const url = `${PROVIDER_BASE.yahoo}/${encodeURIComponent(yahooSymbolFor(commodityId))}?interval=1d&period1=${p1}&period2=${p2}`;
    return mapYahooHistory(commodityId, await getJson(url, ''));
  }
  const symbol = symbolFor(commodityId);
  const url =
    `${PROVIDER_BASE[provider]}/timeseries?symbols=${encodeURIComponent(symbol)}&base=USD` +
    `&start_date=${encodeURIComponent(fromISO)}&end_date=${encodeURIComponent(toISO)}` +
    `&apiKey=${encodeURIComponent(apiKey)}`;
  const raw = await getJson(url, apiKey);
  return mapHistory(commodityId, raw, provider);
}
