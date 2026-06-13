// Pure UN Comtrade response normalization. NO I/O, NO secrets — safe to
// unit-test. The serverless proxy fetches raw Comtrade JSON and runs it through
// these functions to produce our canonical net-trade shape.
//
// Comtrade quotes trade in USD (primaryValue) reliably across every reporter;
// the physical netWgt/qty fields are sparse and unit-inconsistent. So we net
// trade in USD billions/year — positive = net exporter, negative = net importer
// — which is honest, universally populated, and avoids fragile kg→bbl math.

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
    const reporter = typeof row.reporterDesc === 'string' ? row.reporterDesc.trim() : '';
    if (!reporter || AGGREGATE_REPORTERS.has(reporter)) continue;
    if (num(row.reporterCode) === 0) continue; // World as reporter
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
