// Pure UN Comtrade response normalization. NO I/O, NO secrets — safe to
// unit-test. The serverless proxy fetches raw Comtrade JSON and runs it through
// these functions to produce our canonical net-trade shape.
//
// Comtrade quotes trade in USD (primaryValue) reliably across every reporter;
// the physical netWgt/qty fields are sparse and unit-inconsistent. So we net
// trade in USD billions/year — positive = net exporter, negative = net importer
// — which is honest, universally populated, and avoids fragile kg→bbl math.

import { areaIso, areaName } from './comtradeAreas';

// Net-trade row, structurally compatible with src/types CountryTradeBalance.
export interface TradeBalanceRow {
  country: string;
  netExport: number; // USD billions/year (exports − imports)
  unit: string;
  year: number;
  provenance: 'SOURCED';
  source: string;
}

// commodityId → HS commodity code(s) Comtrade understands, plus a display label.
// We query the headline traded form of each commodity (refined metal / crude /
// petroleum oils) rather than ores, matching what the supply overlay implies.
export const COMTRADE_HS: Record<string, { code: string; label: string }> = {
  crude_oil: { code: '2709', label: 'Petroleum oils, crude' },
  diesel: { code: '2710', label: 'Petroleum oils, refined' },
  gold: { code: '7108', label: 'Gold, unwrought/semi-manufactured' },
  silver: { code: '7106', label: 'Silver, unwrought/semi-manufactured' },
  copper: { code: '7403', label: 'Refined copper' },
  nickel: { code: '7502', label: 'Unwrought nickel' },
  palladium: { code: '711021', label: 'Palladium, unwrought/powder' },
};

export function hsCodeFor(commodityId: string): string {
  const m = COMTRADE_HS[commodityId];
  if (!m) throw new Error(`No Comtrade HS code for commodity: ${commodityId}`);
  return m.code;
}

export function isComtradeCommodity(commodityId: string): boolean {
  return commodityId in COMTRADE_HS;
}

// Comtrade returns aggregate "reporters" mixed in with real countries when you
// query reporterCode=all. Drop World and the standard economic groupings so the
// overlay shows individual countries only.
const AGGREGATE_REPORTERS = new Set([
  'World',
  'EU-27',
  'EU-28',
  'European Union',
  'ASEAN',
  'Other Asia, nes',
  'Areas, nes',
  'Free Zones',
  'Special Categories',
  'Bunkers',
]);

function asRecord(v: unknown): Record<string, unknown> {
  if (v == null || typeof v !== 'object') throw new Error('Expected object in Comtrade response');
  return v as Record<string, unknown>;
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/**
 * Normalize a Comtrade `get` response into per-country net trade (USD billions).
 *
 * Expects rows queried with partnerCode=0 (World) and flowCode=X,M for one HS
 * code & year: each reporter yields up to two rows (export 'X' and import 'M').
 * We sum primaryValue per reporter per flow, net them, convert to USD billions,
 * sort by net export desc, and return the top exporters plus the deepest
 * importers so the overlay shows both ends of the balance.
 */
export function mapNetTrade(
  _commodityId: string,
  raw: unknown,
  year: number,
  opts: { topExporters?: number; topImporters?: number } = {},
): TradeBalanceRow[] {
  const topExporters = opts.topExporters ?? 6;
  const topImporters = opts.topImporters ?? 4;

  const data = asRecord(raw).data;
  if (!Array.isArray(data)) return [];

  // reporter → { exports, imports } in raw USD.
  const byReporter = new Map<string, { exports: number; imports: number }>();
  for (const entry of data) {
    const row = entry as Record<string, unknown>;
    if (num(row.reporterCode) === 0) continue; // World as reporter
    // The data API returns null reporterDesc — resolve the name from its code.
    const reporter = areaName(row.reporterCode, row.reporterISO, row.reporterDesc);
    if (!reporter || AGGREGATE_REPORTERS.has(reporter)) continue;
    const flow = String(row.flowCode ?? row.flowDesc ?? '').toUpperCase();
    const value = num(row.primaryValue);
    if (value <= 0) continue;
    const acc = byReporter.get(reporter) ?? { exports: 0, imports: 0 };
    if (flow.startsWith('X')) acc.exports += value;
    else if (flow.startsWith('M')) acc.imports += value;
    byReporter.set(reporter, acc);
  }

  const source = 'UN Comtrade';
  const rows: TradeBalanceRow[] = [];
  for (const [country, { exports, imports }] of byReporter) {
    rows.push({
      country,
      netExport: round2((exports - imports) / 1e9),
      unit: '$B/yr',
      year,
      provenance: 'SOURCED',
      source,
    });
  }

  rows.sort((a, b) => b.netExport - a.netExport);
  const exporters = rows.filter((r) => r.netExport > 0).slice(0, topExporters);
  const importers = rows
    .filter((r) => r.netExport < 0)
    .slice(-topImporters)
    .reverse(); // deepest importer first among the bottom slice
  // Combine, drop accidental dupes, keep exporter-then-importer order.
  const seen = new Set<string>();
  const out: TradeBalanceRow[] = [];
  for (const r of [...exporters, ...importers]) {
    if (seen.has(r.country)) continue;
    seen.add(r.country);
    out.push(r);
  }
  return out;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Port trade detail — per-reporter item profile + top partner countries.
// Powers the Ports-tab "Trade detail" sections. Reporter (the port's country)
// must resolve to a Comtrade M49 code; non-country labels (regions) don't.
// ─────────────────────────────────────────────────────────────────────────────

// Port-country display name → Comtrade reporter code (M49, Comtrade variants).
// Verified against comtradeapi.un.org reference (Norway 579, France 251,
// Switzerland 757, India 699 are Comtrade-specific).
export const COMTRADE_REPORTERS: Record<string, number> = {
  'United States': 842,
  China: 156,
  'Saudi Arabia': 682,
  Russia: 643,
  Netherlands: 528,
  'United Arab Emirates': 784,
  UAE: 784,
  Singapore: 702,
  India: 699,
  Japan: 392,
  'South Korea': 410,
  Germany: 276,
  Brazil: 76,
  Chile: 152,
  Peru: 604,
  Mexico: 484,
  Australia: 36,
  Indonesia: 360,
  Philippines: 608,
  'South Africa': 710,
  Canada: 124,
  'United Kingdom': 826,
  Switzerland: 757,
  Poland: 616,
  Nigeria: 566,
  Iraq: 368,
  France: 251,
  Belgium: 56,
  Spain: 724,
  Italy: 380,
  Malaysia: 458,
  Norway: 579,
  Egypt: 818,
  'Hong Kong': 344,
  Turkey: 792,
  Pakistan: 586,
  Vietnam: 704,
  Finland: 246,
  'DR Congo': 180,
};

export function reporterCodeFor(country: string): number | undefined {
  return COMTRADE_REPORTERS[country];
}

export interface ItemTradeProfile {
  exportUsdB: number;
  importUsdB: number;
  exportSharePct: number; // exports / (exports + imports) × 100
  year: number;
  source: string;
}

export interface PartnerShareRow {
  country: string;
  iso?: string; // ISO3 (for placing trade lanes on the map)
  sharePct: number; // share of this flow's partner total
  valueUsdB: number;
  direction: 'export' | 'import';
}

/**
 * Item profile for one reporter+commodity: total export ('X') and import ('M')
 * value (USD bn) and the export share. Expects a reporterCode + partnerCode=0
 * (World), flowCode=X,M query for one HS code & year.
 */
export function mapItemProfile(raw: unknown, year: number): ItemTradeProfile | null {
  const data = asRecord(raw).data;
  if (!Array.isArray(data)) return null;
  let exports = 0;
  let imports = 0;
  for (const entry of data) {
    const row = entry as Record<string, unknown>;
    const flow = String(row.flowCode ?? row.flowDesc ?? '').toUpperCase();
    const value = num(row.primaryValue);
    if (value <= 0) continue;
    if (flow.startsWith('X')) exports += value;
    else if (flow.startsWith('M')) imports += value;
  }
  if (exports <= 0 && imports <= 0) return null;
  const total = exports + imports;
  return {
    exportUsdB: round2(exports / 1e9),
    importUsdB: round2(imports / 1e9),
    exportSharePct: Math.round((exports / total) * 100),
    year,
    source: 'UN Comtrade',
  };
}

/**
 * Top partner countries for one reporter+commodity, split by flow. Expects a
 * reporterCode + all-partners (partnerCode omitted), flowCode=X,M query. Drops
 * World/aggregate partners and ranks the rest by value within each flow.
 */
export function mapTopPartners(
  raw: unknown,
  opts: { topPerFlow?: number } = {},
): PartnerShareRow[] {
  const topPerFlow = opts.topPerFlow ?? 5;
  const data = asRecord(raw).data;
  if (!Array.isArray(data)) return [];

  // { exports, imports } raw-USD + ISO3 per partner.
  const byPartner = new Map<string, { exports: number; imports: number; iso?: string }>();
  for (const entry of data) {
    const row = entry as Record<string, unknown>;
    if (num(row.partnerCode) === 0) continue; // World aggregate
    const partner = areaName(row.partnerCode, row.partnerISO, row.partnerDesc);
    if (!partner || AGGREGATE_REPORTERS.has(partner)) continue;
    const flow = String(row.flowCode ?? row.flowDesc ?? '').toUpperCase();
    const value = num(row.primaryValue);
    if (value <= 0) continue;
    const acc = byPartner.get(partner) ?? { exports: 0, imports: 0 };
    acc.iso = acc.iso ?? areaIso(row.partnerCode, row.partnerISO);
    if (flow.startsWith('X')) acc.exports += value;
    else if (flow.startsWith('M')) acc.imports += value;
    byPartner.set(partner, acc);
  }

  const pick = (dir: 'export' | 'import'): PartnerShareRow[] => {
    const entries = [...byPartner.entries()]
      .map(([country, v]) => ({ country, iso: v.iso, value: dir === 'export' ? v.exports : v.imports }))
      .filter((e) => e.value > 0)
      .sort((a, b) => b.value - a.value);
    const total = entries.reduce((s, e) => s + e.value, 0);
    if (total <= 0) return [];
    return entries.slice(0, topPerFlow).map((e) => ({
      country: e.country,
      iso: e.iso,
      sharePct: Math.round((e.value / total) * 100),
      valueUsdB: round2(e.value / 1e9),
      direction: dir,
    }));
  };

  return [...pick('export'), ...pick('import')];
}
