// Countries selectable in the Route Map "Trade lanes" view. Names MUST match the
// server's COMTRADE_REPORTERS keys (the /api/comtrade/port-trade endpoint
// resolves country → reporter code by name); iso3 places the country on the map.
// Note: a few reporters (Russia, Saudi Arabia) report only totals to Comtrade,
// so their partner lanes come back empty — the UI shows that honestly.
export interface TradeCountry {
  name: string;
  iso3: string;
}

export const TRADE_COUNTRIES: TradeCountry[] = [
  { name: 'United States', iso3: 'USA' },
  { name: 'China', iso3: 'CHN' },
  { name: 'Germany', iso3: 'DEU' },
  { name: 'Japan', iso3: 'JPN' },
  { name: 'United Kingdom', iso3: 'GBR' },
  { name: 'France', iso3: 'FRA' },
  { name: 'India', iso3: 'IND' },
  { name: 'South Korea', iso3: 'KOR' },
  { name: 'Netherlands', iso3: 'NLD' },
  { name: 'Italy', iso3: 'ITA' },
  { name: 'Canada', iso3: 'CAN' },
  { name: 'Saudi Arabia', iso3: 'SAU' },
  { name: 'United Arab Emirates', iso3: 'ARE' },
  { name: 'Russia', iso3: 'RUS' },
  { name: 'Brazil', iso3: 'BRA' },
  { name: 'Australia', iso3: 'AUS' },
  { name: 'Mexico', iso3: 'MEX' },
  { name: 'Singapore', iso3: 'SGP' },
  { name: 'Spain', iso3: 'ESP' },
  { name: 'Switzerland', iso3: 'CHE' },
  { name: 'Belgium', iso3: 'BEL' },
  { name: 'Indonesia', iso3: 'IDN' },
  { name: 'Turkey', iso3: 'TUR' },
  { name: 'Chile', iso3: 'CHL' },
  { name: 'Peru', iso3: 'PER' },
  { name: 'South Africa', iso3: 'ZAF' },
  { name: 'Nigeria', iso3: 'NGA' },
  { name: 'Norway', iso3: 'NOR' },
  { name: 'Poland', iso3: 'POL' },
  { name: 'Malaysia', iso3: 'MYS' },
  { name: 'Vietnam', iso3: 'VNM' },
  { name: 'Egypt', iso3: 'EGY' },
];

export function tradeCountry(name: string): TradeCountry | undefined {
  return TRADE_COUNTRIES.find((c) => c.name === name);
}
