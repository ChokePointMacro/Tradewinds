import type { CountryProduction, CountryReserves } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Production & reserves by country — SOURCED from official agency datasets.
//
// These are annual published figures (not real-time), so the "source" is a cited
// dataset with an `asOf` year rather than a live API call: metals from the USGS
// Mineral Commodity Summaries, oil/diesel from the EIA. Every row carries its
// real source + URL so the UI attributes it honestly and staleness is visible.
//
// asOf 2024 (USGS MCS 2025 / EIA 2024 editions). Pending the owner's weekend
// refresh to the latest 2025 figures — see PRODUCTION_AUDIT.md.
// ─────────────────────────────────────────────────────────────────────────────

const ASOF = 2024;

const USGS = {
  source: 'USGS Mineral Commodity Summaries 2025',
  sourceUrl:
    'https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries',
};
const EIA = {
  source: 'EIA Petroleum & Other Liquids',
  sourceUrl: 'https://www.eia.gov/petroleum/data.php',
};

type Cite = { source: string; sourceUrl: string };
type RawRow = { country: string; amount: number; unit: string };

function cite(rows: RawRow[], src: Cite, year = ASOF): (CountryProduction & CountryReserves)[] {
  return rows.map((r) => ({ ...r, year, source: src.source, sourceUrl: src.sourceUrl }));
}

const PRODUCTION: Record<string, CountryProduction[]> = {
  crude_oil: cite(
    [
      { country: 'United States', amount: 13.2, unit: 'Mbbl/d' },
      { country: 'Saudi Arabia', amount: 9.7, unit: 'Mbbl/d' },
      { country: 'Russia', amount: 9.4, unit: 'Mbbl/d' },
      { country: 'Canada', amount: 4.9, unit: 'Mbbl/d' },
      { country: 'Iraq', amount: 4.3, unit: 'Mbbl/d' },
    ],
    EIA,
  ),
  diesel: cite(
    [
      { country: 'United States', amount: 5.0, unit: 'Mbbl/d' },
      { country: 'China', amount: 3.6, unit: 'Mbbl/d' },
      { country: 'India', amount: 1.8, unit: 'Mbbl/d' },
      { country: 'Russia', amount: 1.6, unit: 'Mbbl/d' },
      { country: 'Saudi Arabia', amount: 1.0, unit: 'Mbbl/d' },
    ],
    EIA,
  ),
  gold: cite(
    [
      { country: 'China', amount: 370, unit: 't/yr' },
      { country: 'Australia', amount: 310, unit: 't/yr' },
      { country: 'Russia', amount: 310, unit: 't/yr' },
      { country: 'Canada', amount: 200, unit: 't/yr' },
      { country: 'United States', amount: 170, unit: 't/yr' },
    ],
    USGS,
  ),
  silver: cite(
    [
      { country: 'Mexico', amount: 6300, unit: 't/yr' },
      { country: 'China', amount: 3400, unit: 't/yr' },
      { country: 'Peru', amount: 3100, unit: 't/yr' },
      { country: 'Chile', amount: 1400, unit: 't/yr' },
      { country: 'Poland', amount: 1300, unit: 't/yr' },
    ],
    USGS,
  ),
  copper: cite(
    [
      { country: 'Chile', amount: 5300, unit: 'kt/yr' },
      { country: 'Peru', amount: 2600, unit: 'kt/yr' },
      { country: 'DR Congo', amount: 2500, unit: 'kt/yr' },
      { country: 'China', amount: 1800, unit: 'kt/yr' },
      { country: 'United States', amount: 1100, unit: 'kt/yr' },
    ],
    USGS,
  ),
  nickel: cite(
    [
      { country: 'Indonesia', amount: 2200, unit: 'kt/yr' },
      { country: 'Philippines', amount: 330, unit: 'kt/yr' },
      { country: 'Russia', amount: 200, unit: 'kt/yr' },
      { country: 'New Caledonia', amount: 190, unit: 'kt/yr' },
      { country: 'Australia', amount: 160, unit: 'kt/yr' },
    ],
    USGS,
  ),
  palladium: cite(
    [
      { country: 'Russia', amount: 88, unit: 't/yr' },
      { country: 'South Africa', amount: 74, unit: 't/yr' },
      { country: 'Canada', amount: 17, unit: 't/yr' },
      { country: 'United States', amount: 14, unit: 't/yr' },
      { country: 'Zimbabwe', amount: 12, unit: 't/yr' },
    ],
    USGS,
  ),
};

const RESERVES: Record<string, CountryReserves[]> = {
  crude_oil: cite(
    [
      { country: 'Venezuela', amount: 303, unit: 'Gbbl' },
      { country: 'Saudi Arabia', amount: 267, unit: 'Gbbl' },
      { country: 'Iran', amount: 209, unit: 'Gbbl' },
    ],
    EIA,
  ),
  gold: cite(
    [
      { country: 'Australia', amount: 12000, unit: 't' },
      { country: 'Russia', amount: 11000, unit: 't' },
      { country: 'South Africa', amount: 5000, unit: 't' },
    ],
    USGS,
  ),
  silver: cite(
    [
      { country: 'Peru', amount: 98000, unit: 't' },
      { country: 'Australia', amount: 94000, unit: 't' },
      { country: 'China', amount: 72000, unit: 't' },
    ],
    USGS,
  ),
  copper: cite(
    [
      { country: 'Chile', amount: 190000, unit: 'kt' },
      { country: 'Australia', amount: 100000, unit: 'kt' },
      { country: 'Peru', amount: 100000, unit: 'kt' },
    ],
    USGS,
  ),
  nickel: cite(
    [
      { country: 'Indonesia', amount: 55000, unit: 'kt' },
      { country: 'Australia', amount: 24000, unit: 'kt' },
      { country: 'Brazil', amount: 16000, unit: 'kt' },
    ],
    USGS,
  ),
  palladium: cite(
    [
      { country: 'South Africa', amount: 21000, unit: 't' },
      { country: 'Russia', amount: 3900, unit: 't' },
      { country: 'United States', amount: 900, unit: 't' },
    ],
    USGS,
  ),
};

export function productionFor(commodityId: string): CountryProduction[] {
  return PRODUCTION[commodityId] ?? [];
}

export function reservesFor(commodityId: string): CountryReserves[] {
  return RESERVES[commodityId] ?? [];
}

export const PRODUCTION_RESERVES_ASOF = ASOF;
