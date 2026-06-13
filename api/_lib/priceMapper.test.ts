import { describe, expect, it } from 'vitest';
import {
  mapHistory,
  mapRate,
  mapSpot,
  mapYahooHistory,
  mapYahooSpot,
  symbolFor,
  yahooMult,
  yahooSymbolFor,
} from './priceMapper';

describe('priceMapper', () => {
  it('symbolFor maps known commodities and throws on unknown', () => {
    expect(symbolFor('gold')).toBe('XAU');
    expect(symbolFor('crude_oil')).toBe('WTIOIL');
    expect(() => symbolFor('platinum')).toThrow();
  });

  it('mapRate inverts commoditypriceapi rates (units-per-USD → USD price)', () => {
    // 1 USD buys 0.000425 oz of gold → $2352.94/oz
    expect(mapRate(0.000425, 'commoditypriceapi')).toBeCloseTo(1 / 0.000425, 6);
  });

  it('mapRate passes through providers that already quote USD price', () => {
    expect(mapRate(2350, 'oilpriceapi')).toBe(2350);
  });

  it('mapRate rejects non-positive / non-finite rates', () => {
    expect(() => mapRate(0, 'commoditypriceapi')).toThrow();
    expect(() => mapRate(-1, 'oilpriceapi')).toThrow();
    expect(() => mapRate(Number.NaN, 'commoditypriceapi')).toThrow();
  });

  it('mapSpot inverts and labels the source, using provider timestamp', () => {
    const ts = 1_700_000_000;
    const spot = mapSpot(
      'gold',
      { base: 'USD', timestamp: ts, rates: { XAU: 0.0004, XAG: 0.03 } },
      'commoditypriceapi',
      '2026-01-01T00:00:00.000Z',
    );
    expect(spot.price).toBeCloseTo(2500, 2); // 1/0.0004
    expect(spot.unit).toBe('ozt');
    expect(spot.currency).toBe('USD');
    expect(spot.source).toBe('CommodityPriceAPI');
    expect(spot.asOfISO).toBe(new Date(ts * 1000).toISOString());
  });

  it('mapSpot falls back to nowISO when timestamp absent', () => {
    const now = '2026-06-11T12:00:00.000Z';
    const spot = mapSpot('silver', { rates: { XAG: 0.0357 } }, 'commoditypriceapi', now);
    expect(spot.asOfISO).toBe(now);
    expect(spot.price).toBeCloseTo(1 / 0.0357, 2);
  });

  it('mapSpot throws on missing symbol', () => {
    expect(() => mapSpot('gold', { rates: { XAG: 0.03 } }, 'commoditypriceapi', 'x')).toThrow();
  });

  it('mapHistory returns sorted, inverted, positive points and skips bad days', () => {
    const points = mapHistory(
      'gold',
      {
        rates: {
          '2024-01-03': { XAU: 0.0004 },
          '2024-01-01': { XAU: 0.0005 },
          '2024-01-02': { XAU: 0 }, // skipped (non-positive)
          '2024-01-04': { XAG: 0.03 }, // skipped (no XAU)
        },
      },
      'commoditypriceapi',
    );
    expect(points.map((p) => p.dateISO)).toEqual(['2024-01-01', '2024-01-03']);
    expect(points[0]!.close).toBeCloseTo(1 / 0.0005, 2);
    expect(points[1]!.close).toBeCloseTo(1 / 0.0004, 2);
  });

  it('yahooSymbolFor maps known commodities and throws on unknown', () => {
    expect(yahooSymbolFor('gold')).toBe('GC=F');
    expect(yahooSymbolFor('crude_oil')).toBe('CL=F');
    expect(() => yahooSymbolFor('platinum')).toThrow();
  });

  it('mapYahooSpot reads the USD price directly (no inversion) from chart meta', () => {
    const ts = 1_781_227_018;
    const spot = mapYahooSpot(
      'gold',
      { chart: { result: [{ meta: { regularMarketPrice: 4212.5, regularMarketTime: ts } }] } },
      '2026-01-01T00:00:00.000Z',
    );
    expect(spot.price).toBe(4212.5);
    expect(spot.unit).toBe('ozt');
    expect(spot.source).toBe('Yahoo Finance');
    expect(spot.asOfISO).toBe(new Date(ts * 1000).toISOString());
  });

  it('mapYahooSpot falls back to nowISO when time absent and throws on missing price', () => {
    const now = '2026-06-11T12:00:00.000Z';
    const spot = mapYahooSpot(
      'crude_oil',
      { chart: { result: [{ meta: { regularMarketPrice: 86.73 } }] } },
      now,
    );
    expect(spot.asOfISO).toBe(now);
    expect(spot.unit).toBe('bbl');
    expect(() =>
      mapYahooSpot('gold', { chart: { result: [{ meta: {} }] } }, now),
    ).toThrow();
  });

  it('mapYahooSpot surfaces Yahoo error envelopes', () => {
    expect(() =>
      mapYahooSpot('gold', { chart: { result: null, error: { code: 'Not Found' } } }, 'x'),
    ).toThrow(/Yahoo error/);
  });

  it('mapYahooHistory zips timestamp/close arrays, skips null closes, sorts ascending', () => {
    const points = mapYahooHistory('gold', {
      chart: {
        result: [
          {
            timestamp: [1_704_153_600, 1_704_240_000, 1_704_326_400],
            indicators: { quote: [{ close: [2050.4, null, 2061.9] }] },
          },
        ],
      },
    });
    expect(points).toHaveLength(2);
    expect(points[0]!.dateISO < points[1]!.dateISO).toBe(true);
    expect(points[0]!.close).toBe(2050.4);
    expect(points[1]!.close).toBe(2061.9);
  });

  it('yahooSymbolFor/yahooMult map the new commodities and reject keyless-absent ones', () => {
    expect(yahooSymbolFor('copper')).toBe('HG=F');
    expect(yahooSymbolFor('palladium')).toBe('PA=F');
    expect(yahooSymbolFor('diesel')).toBe('HO=F');
    expect(yahooMult('palladium')).toBe(1);
    // nickel has no keyless future → throws so the proxy falls back to mock
    expect(() => yahooSymbolFor('nickel')).toThrow();
  });

  it('mapYahooSpot converts copper USD/lb → USD/tonne and diesel USD/gal → USD/bbl', () => {
    const copper = mapYahooSpot(
      'copper',
      { chart: { result: [{ meta: { regularMarketPrice: 6.376 } }] } },
      'x',
    );
    expect(copper.unit).toBe('tonne');
    expect(copper.price).toBeCloseTo(6.376 * 2204.622, 0);

    const diesel = mapYahooSpot(
      'diesel',
      { chart: { result: [{ meta: { regularMarketPrice: 3.47 } }] } },
      'x',
    );
    expect(diesel.unit).toBe('bbl');
    expect(diesel.price).toBeCloseTo(3.47 * 42, 2);
  });

  it('mapYahooHistory applies the unit multiplier to each close', () => {
    const points = mapYahooHistory('diesel', {
      chart: {
        result: [{ timestamp: [1_704_153_600], indicators: { quote: [{ close: [3.5] }] } }],
      },
    });
    expect(points[0]!.close).toBeCloseTo(3.5 * 42, 2);
  });
});
