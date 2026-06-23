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
const FAO = {
  source: 'FAOSTAT (production, 2023)',
  sourceUrl: 'https://www.fao.org/faostat/en/#data/QCL',
};
const IFA = {
  source: 'FAO/IFA fertilizer production',
  sourceUrl: 'https://www.fao.org/faostat/en/#data/RFN',
};
const WNA = {
  source: 'World Nuclear Association (uranium mining, 2024)',
  sourceUrl:
    'https://world-nuclear.org/information-library/nuclear-fuel-cycle/mining-of-uranium/world-uranium-mining-production',
};
// Industry estimates for chemicals & semiconductor materials with no single
// official tonnage agency (Methanol Institute / ICIS / IEA / Bernreuter / SEMI).
// Country output for several of these is poorly disclosed — treat ranks beyond
// the leader as indicative; flagged for the owner's audit.
const INDUSTRY = {
  source: 'Industry estimates (Methanol Institute / ICIS / IEA / SEMI)',
  sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025',
};

type Cite = { source: string; sourceUrl: string };
type RawRow = { country: string; amount: number; unit: string };

function cite(rows: RawRow[], src: Cite, year = ASOF): (CountryProduction & CountryReserves)[] {
  return rows.map((r) => ({ ...r, year, source: src.source, sourceUrl: src.sourceUrl }));
}

// Rare-earth mine production / reserves (USGS, REO content, kt) — shared by the
// individual rare-earth commodities since USGS does not split by element.
const REE_PRODUCTION = cite(
  [
    { country: 'China', amount: 270, unit: 'kt/yr' },
    { country: 'United States', amount: 45, unit: 'kt/yr' },
    { country: 'Myanmar', amount: 31, unit: 'kt/yr' },
    { country: 'Australia', amount: 13, unit: 'kt/yr' },
    { country: 'Thailand', amount: 13, unit: 'kt/yr' },
  ],
  USGS,
);
const REE_RESERVES = cite(
  [
    { country: 'China', amount: 44000, unit: 'kt' },
    { country: 'Brazil', amount: 21000, unit: 'kt' },
    { country: 'India', amount: 6900, unit: 'kt' },
    { country: 'Australia', amount: 5700, unit: 'kt' },
    { country: 'United States', amount: 1900, unit: 'kt' },
  ],
  USGS,
);

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
  // Rare earths: USGS reports mine production as total REO content (not by
  // element), so neodymium and dysprosium share the same country distribution —
  // the concentration/jurisdiction signal is what the resilience score uses.
  neodymium: REE_PRODUCTION,
  dysprosium: REE_PRODUCTION,
  // Food inputs — FAOSTAT top producers (2023). Reserves don't apply.
  wheat: cite(
    [
      { country: 'China', amount: 137, unit: 'Mt/yr' },
      { country: 'India', amount: 111, unit: 'Mt/yr' },
      { country: 'Russia', amount: 92, unit: 'Mt/yr' },
      { country: 'United States', amount: 49, unit: 'Mt/yr' },
      { country: 'Canada', amount: 35, unit: 'Mt/yr' },
    ],
    FAO,
  ),
  corn: cite(
    [
      { country: 'United States', amount: 390, unit: 'Mt/yr' },
      { country: 'China', amount: 289, unit: 'Mt/yr' },
      { country: 'Brazil', amount: 137, unit: 'Mt/yr' },
      { country: 'Argentina', amount: 59, unit: 'Mt/yr' },
      { country: 'India', amount: 38, unit: 'Mt/yr' },
    ],
    FAO,
  ),
  soybeans: cite(
    [
      { country: 'Brazil', amount: 152, unit: 'Mt/yr' },
      { country: 'United States', amount: 113, unit: 'Mt/yr' },
      { country: 'Argentina', amount: 48, unit: 'Mt/yr' },
      { country: 'China', amount: 20, unit: 'Mt/yr' },
      { country: 'India', amount: 13, unit: 'Mt/yr' },
    ],
    FAO,
  ),
  beef: cite(
    [
      { country: 'United States', amount: 12.3, unit: 'Mt/yr' },
      { country: 'Brazil', amount: 10.5, unit: 'Mt/yr' },
      { country: 'China', amount: 7.5, unit: 'Mt/yr' },
      { country: 'Argentina', amount: 3.1, unit: 'Mt/yr' },
      { country: 'Australia', amount: 2.5, unit: 'Mt/yr' },
    ],
    FAO,
  ),
  pork: cite(
    [
      { country: 'China', amount: 57, unit: 'Mt/yr' },
      { country: 'United States', amount: 12.4, unit: 'Mt/yr' },
      { country: 'Spain', amount: 5.0, unit: 'Mt/yr' },
      { country: 'Germany', amount: 4.9, unit: 'Mt/yr' },
      { country: 'Brazil', amount: 4.5, unit: 'Mt/yr' },
    ],
    FAO,
  ),
  eggs: cite(
    [
      { country: 'China', amount: 35, unit: 'Mt/yr' },
      { country: 'United States', amount: 6.6, unit: 'Mt/yr' },
      { country: 'India', amount: 6.5, unit: 'Mt/yr' },
      { country: 'Indonesia', amount: 5.5, unit: 'Mt/yr' },
      { country: 'Brazil', amount: 3.5, unit: 'Mt/yr' },
    ],
    FAO,
  ),
  fertilizer: cite(
    [
      { country: 'China', amount: 55, unit: 'Mt/yr' },
      { country: 'India', amount: 25, unit: 'Mt/yr' },
      { country: 'Russia', amount: 14, unit: 'Mt/yr' },
      { country: 'United States', amount: 13, unit: 'Mt/yr' },
      { country: 'Indonesia', amount: 8, unit: 'Mt/yr' },
    ],
    IFA,
  ),
  // ── Critical minerals (USGS MCS 2025, 2024 estimates; uranium = WNA 2024) ──
  lithium: cite(
    [
      { country: 'Australia', amount: 88, unit: 'kt/yr' },
      { country: 'Chile', amount: 49, unit: 'kt/yr' },
      { country: 'China', amount: 41, unit: 'kt/yr' },
      { country: 'Zimbabwe', amount: 22, unit: 'kt/yr' },
      { country: 'Argentina', amount: 18, unit: 'kt/yr' },
    ],
    USGS,
  ),
  cobalt: cite(
    [
      { country: 'DR Congo', amount: 220, unit: 'kt/yr' },
      { country: 'Indonesia', amount: 28, unit: 'kt/yr' },
      { country: 'Russia', amount: 8.7, unit: 'kt/yr' },
      { country: 'Canada', amount: 4.5, unit: 'kt/yr' },
      { country: 'Philippines', amount: 3.8, unit: 'kt/yr' },
    ],
    USGS,
  ),
  graphite: cite(
    [
      { country: 'China', amount: 1270, unit: 'kt/yr' },
      { country: 'Madagascar', amount: 89, unit: 'kt/yr' },
      { country: 'Mozambique', amount: 75, unit: 'kt/yr' },
      { country: 'Brazil', amount: 68, unit: 'kt/yr' },
      { country: 'Russia', amount: 20, unit: 'kt/yr' },
    ],
    USGS,
  ),
  manganese: cite(
    [
      { country: 'South Africa', amount: 7400, unit: 'kt/yr' },
      { country: 'Gabon', amount: 4600, unit: 'kt/yr' },
      { country: 'Australia', amount: 2800, unit: 'kt/yr' },
      { country: 'India', amount: 800, unit: 'kt/yr' },
      { country: 'China', amount: 770, unit: 'kt/yr' },
    ],
    USGS,
  ),
  titanium: cite(
    [
      { country: 'China', amount: 220, unit: 'kt/yr' },
      { country: 'Japan', amount: 55, unit: 'kt/yr' },
      { country: 'Russia', amount: 20, unit: 'kt/yr' },
      { country: 'Saudi Arabia', amount: 15, unit: 'kt/yr' },
      { country: 'Kazakhstan', amount: 14, unit: 'kt/yr' },
    ],
    USGS,
  ),
  tungsten: cite(
    [
      { country: 'China', amount: 67, unit: 'kt/yr' },
      { country: 'Vietnam', amount: 3.4, unit: 'kt/yr' },
      { country: 'Russia', amount: 2, unit: 'kt/yr' },
      { country: 'North Korea', amount: 1.7, unit: 'kt/yr' },
      { country: 'Bolivia', amount: 1.6, unit: 'kt/yr' },
    ],
    USGS,
  ),
  uranium: cite(
    [
      { country: 'Kazakhstan', amount: 23270, unit: 'tU/yr' },
      { country: 'Canada', amount: 14309, unit: 'tU/yr' },
      { country: 'Namibia', amount: 7333, unit: 'tU/yr' },
      { country: 'Australia', amount: 4598, unit: 'tU/yr' },
      { country: 'Uzbekistan', amount: 4000, unit: 'tU/yr' },
    ],
    WNA,
  ),
  // ── Rare-earth compounds: shares the USGS REO distribution ──
  re_compounds: REE_PRODUCTION,
  // ── Industrial chemicals (USGS for ammonia/sulfur; industry estimates else) ──
  ammonia: cite(
    [
      { country: 'China', amount: 43, unit: 'Mt N/yr' },
      { country: 'Russia', amount: 14, unit: 'Mt N/yr' },
      { country: 'United States', amount: 14, unit: 'Mt N/yr' },
      { country: 'India', amount: 13, unit: 'Mt N/yr' },
      { country: 'Indonesia', amount: 6.5, unit: 'Mt N/yr' },
    ],
    USGS,
  ),
  sulfuric_acid: cite(
    [
      { country: 'China', amount: 19.4, unit: 'Mt S/yr' },
      { country: 'United States', amount: 8.65, unit: 'Mt S/yr' },
      { country: 'Russia', amount: 7.53, unit: 'Mt S/yr' },
      { country: 'Saudi Arabia', amount: 7.5, unit: 'Mt S/yr' },
      { country: 'Kazakhstan', amount: 5.1, unit: 'Mt S/yr' },
    ],
    USGS,
  ),
  methanol: cite(
    [
      { country: 'China', amount: 50, unit: 'Mt/yr' },
      { country: 'United States', amount: 9, unit: 'Mt/yr' },
      { country: 'Iran', amount: 9, unit: 'Mt/yr' },
      { country: 'Saudi Arabia', amount: 7, unit: 'Mt/yr' },
      { country: 'Russia', amount: 5, unit: 'Mt/yr' },
    ],
    INDUSTRY,
  ),
  ethylene: cite(
    [
      { country: 'China', amount: 45, unit: 'Mt/yr' },
      { country: 'United States', amount: 38, unit: 'Mt/yr' },
      { country: 'Saudi Arabia', amount: 19, unit: 'Mt/yr' },
      { country: 'South Korea', amount: 13, unit: 'Mt/yr' },
      { country: 'India', amount: 9, unit: 'Mt/yr' },
    ],
    INDUSTRY,
  ),
  caustic_soda: cite(
    [
      { country: 'China', amount: 40, unit: 'Mt/yr' },
      { country: 'United States', amount: 10, unit: 'Mt/yr' },
      { country: 'Germany', amount: 4, unit: 'Mt/yr' },
      { country: 'Japan', amount: 4, unit: 'Mt/yr' },
      { country: 'India', amount: 4, unit: 'Mt/yr' },
    ],
    INDUSTRY,
  ),
  // ── Semiconductor materials (USGS for gallium; industry estimates else) ──
  polysilicon: cite(
    [
      { country: 'China', amount: 1900, unit: 'kt/yr' },
      { country: 'Germany', amount: 90, unit: 'kt/yr' },
      { country: 'United States', amount: 60, unit: 'kt/yr' },
      { country: 'Malaysia', amount: 50, unit: 'kt/yr' },
      { country: 'Japan', amount: 40, unit: 'kt/yr' },
    ],
    INDUSTRY,
  ),
  gallium: cite(
    [
      { country: 'China', amount: 600, unit: 't/yr' },
      { country: 'Russia', amount: 5, unit: 't/yr' },
      { country: 'Japan', amount: 3, unit: 't/yr' },
      { country: 'South Korea', amount: 2, unit: 't/yr' },
    ],
    USGS,
  ),
  germanium: cite(
    [
      { country: 'China', amount: 80, unit: 't/yr' },
      { country: 'Belgium', amount: 25, unit: 't/yr' },
      { country: 'Russia', amount: 5, unit: 't/yr' },
      { country: 'United States', amount: 3, unit: 't/yr' },
    ],
    INDUSTRY,
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
  neodymium: REE_RESERVES,
  dysprosium: REE_RESERVES,
  re_compounds: REE_RESERVES,
  // Critical-mineral reserves (USGS MCS 2025; leading holders).
  lithium: cite(
    [
      { country: 'Chile', amount: 9300, unit: 'kt' },
      { country: 'Australia', amount: 6200, unit: 'kt' },
      { country: 'Argentina', amount: 3600, unit: 'kt' },
      { country: 'China', amount: 3000, unit: 'kt' },
    ],
    USGS,
  ),
  cobalt: cite(
    [
      { country: 'DR Congo', amount: 6000, unit: 'kt' },
      { country: 'Australia', amount: 1700, unit: 'kt' },
      { country: 'Indonesia', amount: 600, unit: 'kt' },
    ],
    USGS,
  ),
  graphite: cite(
    [
      { country: 'China', amount: 78000, unit: 'kt' },
      { country: 'Brazil', amount: 74000, unit: 'kt' },
      { country: 'Mozambique', amount: 25000, unit: 'kt' },
      { country: 'Madagascar', amount: 24000, unit: 'kt' },
    ],
    USGS,
  ),
  manganese: cite(
    [
      { country: 'South Africa', amount: 640000, unit: 'kt' },
      { country: 'Australia', amount: 200000, unit: 'kt' },
      { country: 'Brazil', amount: 140000, unit: 'kt' },
    ],
    USGS,
  ),
  tungsten: cite(
    [
      { country: 'China', amount: 2400, unit: 'kt' },
      { country: 'Russia', amount: 400, unit: 'kt' },
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
