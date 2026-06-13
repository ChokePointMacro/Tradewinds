// Pure provider-response normalization (PRD §16). NO I/O, NO secrets — safe to
// unit-test. The serverless proxy fetches raw provider JSON and runs it through
// these functions to produce our canonical SpotQuote / PricePoint shapes.
//
// THE INVERSE FOOTGUN: providers that quote with base=USD return a "rate" that
// is *commodity units per 1 USD* (e.g. XAU ≈ 0.000425 oz per USD), NOT the USD
// price per unit. The USD price is therefore 1 / rate. Getting this backwards
// silently yields a $0.0004 gold price. mapRate() centralizes the inversion.

export type ProviderId =
  | 'yahoo'
  | 'commoditypriceapi'
  | 'metalpriceapi'
  | 'oilpriceapi'
  | 'apininjas';

export type PriceUnit = 'bbl' | 'ozt' | 'tonne';

export interface NormalizedSpot {
  commodityId: string;
  price: number;
  unit: PriceUnit;
  currency: 'USD';
  asOfISO: string;
  source: string;
}

export interface NormalizedPoint {
  dateISO: string;
  close: number;
}

interface ProviderConfig {
  // true when rates are quoted as commodity-units-per-USD and must be inverted
  inverseRates: boolean;
  label: string;
}

const PROVIDER_CONFIG: Record<ProviderId, ProviderConfig> = {
  yahoo: { inverseRates: false, label: 'Yahoo Finance' },
  commoditypriceapi: { inverseRates: true, label: 'CommodityPriceAPI' },
  metalpriceapi: { inverseRates: true, label: 'MetalPriceAPI' },
  oilpriceapi: { inverseRates: false, label: 'OilPriceAPI' },
  apininjas: { inverseRates: false, label: 'API Ninjas' },
};

// commodityId → provider symbol and our canonical unit.
export const COMMODITY_SYMBOLS: Record<string, { symbol: string; unit: PriceUnit }> = {
  crude_oil: { symbol: 'WTIOIL', unit: 'bbl' },
  gold: { symbol: 'XAU', unit: 'ozt' },
  silver: { symbol: 'XAG', unit: 'ozt' },
  copper: { symbol: 'COPPER', unit: 'tonne' },
  nickel: { symbol: 'NICKEL', unit: 'tonne' },
  palladium: { symbol: 'XPD', unit: 'ozt' },
  diesel: { symbol: 'ULSD', unit: 'bbl' },
  wheat: { symbol: 'WHEAT', unit: 'tonne' },
  corn: { symbol: 'CORN', unit: 'tonne' },
  soybeans: { symbol: 'SOYBEAN', unit: 'tonne' },
  beef: { symbol: 'CATTLE', unit: 'tonne' },
  pork: { symbol: 'HOGS', unit: 'tonne' },
};

export function providerLabel(provider: ProviderId): string {
  return PROVIDER_CONFIG[provider].label;
}

export function symbolFor(commodityId: string): string {
  const m = COMMODITY_SYMBOLS[commodityId];
  if (!m) throw new Error(`Unknown commodity: ${commodityId}`);
  return m.symbol;
}

/** Convert a provider rate to a USD price per unit, applying inversion if needed. */
export function mapRate(rate: number, provider: ProviderId): number {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Invalid provider rate: ${rate}`);
  }
  return PROVIDER_CONFIG[provider].inverseRates ? 1 / rate : rate;
}

function asRecord(v: unknown): Record<string, unknown> {
  if (v == null || typeof v !== 'object') throw new Error('Expected object in provider response');
  return v as Record<string, unknown>;
}

function rateFromMap(rates: Record<string, unknown>, symbol: string): number {
  const raw = rates[symbol];
  if (typeof raw !== 'number') throw new Error(`Missing rate for symbol ${symbol}`);
  return raw;
}

/**
 * Map a "latest"/spot response: { base, timestamp, rates: { [symbol]: number } }.
 * timestamp is provider seconds-since-epoch (optional; falls back to now).
 */
export function mapSpot(
  commodityId: string,
  raw: unknown,
  provider: ProviderId,
  nowISO: string,
): NormalizedSpot {
  const obj = asRecord(raw);
  const rates = asRecord(obj.rates);
  const meta = COMMODITY_SYMBOLS[commodityId];
  if (!meta) throw new Error(`Unknown commodity: ${commodityId}`);
  const price = mapRate(rateFromMap(rates, meta.symbol), provider);
  const ts = typeof obj.timestamp === 'number' ? new Date(obj.timestamp * 1000).toISOString() : nowISO;
  return {
    commodityId,
    price: round2(price),
    unit: meta.unit,
    currency: 'USD',
    asOfISO: ts,
    source: providerLabel(provider),
  };
}

/**
 * Map a timeseries/history response: { rates: { [dateISO]: { [symbol]: number } } }.
 * Returns chronologically sorted points with the price already inverted.
 */
export function mapHistory(commodityId: string, raw: unknown, provider: ProviderId): NormalizedPoint[] {
  const obj = asRecord(raw);
  const byDate = asRecord(obj.rates);
  const symbol = symbolFor(commodityId);
  const out: NormalizedPoint[] = [];
  for (const [dateISO, dayRates] of Object.entries(byDate)) {
    const day = dayRates as Record<string, unknown>;
    const value = day?.[symbol];
    if (typeof value !== 'number' || value <= 0) continue;
    out.push({ dateISO, close: round2(mapRate(value, provider)) });
  }
  out.sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Yahoo Finance (keyless) ───────────────────────────────────────────────────
// Yahoo's chart API needs no API key and quotes USD prices directly (no
// inversion), but uses its own futures symbols and a different response shape
// (meta + parallel timestamp/close arrays) than the rates-map providers above.

// Each entry maps to a Yahoo futures ticker plus a multiplier that converts the
// ticker's native quote into our canonical unit (COMMODITY_SYMBOLS[id].unit):
//   - copper HG=F quotes USD/lb  → ×2204.622 → USD/tonne
//   - diesel HO=F quotes USD/gal → ×42       → USD/bbl
//   - the rest already quote in our unit (×1).
// Nickel has no liquid keyless Yahoo future, so it is intentionally absent and
// falls back to mock pricing.
const LB_PER_TONNE = 2204.622;
const GAL_PER_BBL = 42;
// Grains: CBOT futures quote US cents per bushel → USD/tonne = cents × bu/tonne / 100.
const WHEAT_SOY_BU_PER_T = 36.7437;
const CORN_BU_PER_T = 39.3683;
// Livestock: CME futures quote US cents per pound → USD/tonne = cents × lb/tonne / 100.
const CENTS_LB_TO_USD_T = LB_PER_TONNE / 100;

export const YAHOO_SYMBOLS: Record<string, { symbol: string; mult: number }> = {
  crude_oil: { symbol: 'CL=F', mult: 1 }, // WTI crude front-month future
  gold: { symbol: 'GC=F', mult: 1 }, // COMEX gold future
  silver: { symbol: 'SI=F', mult: 1 }, // COMEX silver future
  copper: { symbol: 'HG=F', mult: LB_PER_TONNE }, // COMEX copper (USD/lb → USD/tonne)
  palladium: { symbol: 'PA=F', mult: 1 }, // NYMEX palladium (USD/ozt)
  diesel: { symbol: 'HO=F', mult: GAL_PER_BBL }, // NYMEX ULSD/heating oil (USD/gal → USD/bbl)
  wheat: { symbol: 'ZW=F', mult: WHEAT_SOY_BU_PER_T / 100 }, // CBOT wheat (¢/bu → USD/tonne)
  corn: { symbol: 'ZC=F', mult: CORN_BU_PER_T / 100 }, // CBOT corn
  soybeans: { symbol: 'ZS=F', mult: WHEAT_SOY_BU_PER_T / 100 }, // CBOT soybeans
  beef: { symbol: 'LE=F', mult: CENTS_LB_TO_USD_T }, // CME live cattle (¢/lb → USD/tonne)
  pork: { symbol: 'HE=F', mult: CENTS_LB_TO_USD_T }, // CME lean hogs
};

export function yahooSymbolFor(commodityId: string): string {
  const m = YAHOO_SYMBOLS[commodityId];
  if (!m) throw new Error(`No keyless Yahoo symbol for commodity: ${commodityId}`);
  return m.symbol;
}

export function yahooMult(commodityId: string): number {
  const m = YAHOO_SYMBOLS[commodityId];
  if (!m) throw new Error(`No keyless Yahoo symbol for commodity: ${commodityId}`);
  return m.mult;
}

function yahooResult(raw: unknown): Record<string, unknown> {
  const chart = asRecord(asRecord(raw).chart);
  if (chart.error != null) throw new Error(`Yahoo error: ${JSON.stringify(chart.error)}`);
  const results = chart.result;
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Yahoo response missing result');
  }
  return asRecord(results[0]);
}

export function mapYahooSpot(commodityId: string, raw: unknown, nowISO: string): NormalizedSpot {
  const meta = COMMODITY_SYMBOLS[commodityId];
  if (!meta) throw new Error(`Unknown commodity: ${commodityId}`);
  const m = asRecord(yahooResult(raw).meta);
  const price = m.regularMarketPrice;
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    throw new Error(`Yahoo missing regularMarketPrice for ${commodityId}`);
  }
  const ts =
    typeof m.regularMarketTime === 'number'
      ? new Date(m.regularMarketTime * 1000).toISOString()
      : nowISO;
  return {
    commodityId,
    price: round2(price * yahooMult(commodityId)),
    unit: meta.unit,
    currency: 'USD',
    asOfISO: ts,
    source: providerLabel('yahoo'),
  };
}

export function mapYahooHistory(commodityId: string, raw: unknown): NormalizedPoint[] {
  const mult = yahooMult(commodityId);
  const result = yahooResult(raw);
  const timestamps = result.timestamp;
  const quoteArr = asRecord(result.indicators).quote;
  if (!Array.isArray(timestamps) || !Array.isArray(quoteArr) || quoteArr.length === 0) {
    return [];
  }
  const closes = asRecord(quoteArr[0]).close;
  if (!Array.isArray(closes)) return [];
  const out: NormalizedPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const close = closes[i];
    if (typeof ts !== 'number' || typeof close !== 'number' || close <= 0) continue;
    out.push({
      dateISO: new Date(ts * 1000).toISOString().slice(0, 10),
      close: round2(close * mult),
    });
  }
  out.sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  return out;
}
