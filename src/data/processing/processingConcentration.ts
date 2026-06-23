import type { ProcessingConcentration } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Midstream processing-concentration register (Recommendations 1, 3, 5).
//
// The central correction of the ChokepointMacro "Twenty-Year Bottleneck" report:
// REFINING, not mining, is the chokepoint. China leads the refining of 19 of the
// 20 most strategic minerals; a mineral with diversified mining but ~90% Chinese
// separation is far more fragile than its mine-based score implies.
//
// Each row is the dominant midstream step for a commodity, with the leading
// processor's capacity share, its substitutability, the 2035 gap-closing
// difficulty, and which of the report's three chokepoint LAYERS it sits in:
//   Layer 1 — mineral processing & separation
//   Layer 2 — heavy industrial equipment / manufacturing capacity
//   Layer 3 — fuel-cycle & feedstock single points of failure
//
// Figures are the report's synthesis of IEA Critical Minerals Outlook 2025 and
// USGS Mineral Commodity Summaries (SOURCED-shaped, cited to the report + agency)
// — analytical judgments to re-verify against primary sources before any
// investment use (see DATA_GAPS.md DATA-PROC-1).
// ─────────────────────────────────────────────────────────────────────────────

const REPORT = {
  source: 'ChokepointMacro — The Twenty-Year Bottleneck (Jun 2026) · IEA / USGS',
  sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025',
};

function row(
  commodityId: string,
  step: string,
  p: Omit<ProcessingConcentration, 'commodityId' | 'step' | 'source' | 'sourceUrl'>,
): ProcessingConcentration {
  return { commodityId, step, ...p, source: REPORT.source, sourceUrl: REPORT.sourceUrl };
}

// Keyed by the dominant midstream step per commodity. Where a commodity has both
// a separation and a downstream manufacturing choke (rare earths → magnets), the
// row reflects the binding step the resilience score should penalise.
export const PROCESSING: Record<string, ProcessingConcentration> = {
  // ── Rare earths: solvent-extraction separation is the #1 chokepoint ──
  neodymium: row('neodymium', 'Solvent-extraction separation (NdPr oxide)', {
    kind: 'separation',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 90,
    substitutability: 'low',
    gap2035: 'severe',
    exportControlled: true,
    note: 'China ~90% of rare-earth separation/refining; IEA sees it easing only to ~80% by 2035. The chemistry & capital of separation — not the ore — is the wall.',
  }),
  dysprosium: row('dysprosium', 'Heavy-REE separation (Dy/Tb)', {
    kind: 'separation',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 92,
    substitutability: 'very_low',
    gap2035: 'severe',
    exportControlled: true,
    note: 'Heavy rare earths are scarcer and even more China-concentrated; the least-substitutable magnet input. Under the April 2025 rare-earth controls.',
  }),
  re_compounds: row('re_compounds', 'Rare-earth separation & refining', {
    kind: 'separation',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 90,
    substitutability: 'low',
    gap2035: 'severe',
    exportControlled: true,
    note: 'Aggregate rare-earth oxide/compound separation — ~90% China; January 2026 catalogue expansion added rare-earth compounds to the control list.',
  }),
  ndfeb_magnets: row('ndfeb_magnets', 'Magnet sintering & magnet-making', {
    kind: 'manufacturing',
    layer: 2,
    leadingCountry: 'China',
    sharePct: 92,
    substitutability: 'low',
    gap2035: 'severe',
    exportControlled: true,
    note: 'Sintered-magnet making is ~90–94% China (IEA) — a Layer-2 manufacturing chokepoint downstream of separation; the US/EU are ~75–98% import-dependent.',
  }),
  // ── Semiconductor by-product metals: recovery, not mining, is the wall ──
  gallium: row('gallium', 'Gallium recovery (from alumina) & refining', {
    kind: 'recovery',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 99,
    substitutability: 'low',
    gap2035: 'severe',
    exportControlled: true,
    note: 'China ~99% of gallium. A by-product of alumina, so Western recovery means re-engineering existing refineries — a processing problem, not a mine. Export-controlled since 2023.',
  }),
  germanium: row('germanium', 'Germanium recovery (from zinc) & refining', {
    kind: 'recovery',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 60,
    substitutability: 'low',
    gap2035: 'high',
    exportControlled: true,
    note: 'China ~60% of germanium refining; a zinc by-product, export-controlled alongside gallium in 2023.',
  }),
  polysilicon: row('polysilicon', 'Polysilicon refining (Siemens / FBR)', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 80,
    substitutability: 'medium',
    gap2035: 'high',
    note: 'China ~80%+ of solar-grade polysilicon refining; high-purity quartz feedstock is a quiet Layer-3 dependency upstream.',
  }),
  // ── Battery midstream: conversion / anode processing is the choke ──
  lithium: row('lithium', 'Chemical conversion (carbonate/hydroxide)', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 65,
    substitutability: 'medium',
    gap2035: 'high',
    note: 'China >60% of refined lithium by 2035 (IEA). Sodium-ion and DLE are substitution/speed levers that erode this over time.',
  }),
  cobalt: row('cobalt', 'Battery-grade refining (sulfate/metal)', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 65,
    substitutability: 'medium',
    gap2035: 'medium',
    note: 'China >60% of refined cobalt. LFP and sodium-ion chemistries avoid cobalt entirely — a design-out substitution lever.',
  }),
  graphite: row('graphite', 'Spherical/coated anode processing', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 80,
    substitutability: 'medium',
    gap2035: 'high',
    exportControlled: true,
    note: 'China ~80% of battery-grade graphite by 2035 (ODI); >90% of anode-grade spherical purification today. Silicon and sodium-ion hard-carbon are substitution routes. Export-controlled 2024.',
  }),
  manganese: row('manganese', 'Battery-grade HPMSM processing', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 90,
    substitutability: 'medium',
    gap2035: 'high',
    note: 'Ore mining is diversified (South Africa, Gabon) but battery-grade high-purity manganese sulfate is ~90% China; ~70% of battery-grade by 2035.',
  }),
  // ── Other contested midstream ──
  tungsten: row('tungsten', 'APT / carbide conversion', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 83,
    substitutability: 'low',
    gap2035: 'high',
    exportControlled: true,
    note: 'China ~83% of tungsten; ammonium-paratungstate and carbide conversion are China-dominated. Defense-critical (cutting tools, penetrators).',
  }),
  copper: row('copper', 'Smelting & refining', {
    kind: 'refining',
    layer: 1,
    leadingCountry: 'China',
    sharePct: 45,
    substitutability: 'low',
    gap2035: 'high',
    note: 'Mining is diversified but China ~40%+ of smelting/refining capacity. Copper is the irreplaceable electrification metal — the risk is volume, not substitution.',
  }),
  // ── Fuel cycle (Layer 3): enrichment is the single point of failure ──
  uranium: row('uranium', 'Enrichment (SWU / HALEU)', {
    kind: 'enrichment',
    layer: 3,
    leadingCountry: 'Russia',
    sharePct: 44,
    substitutability: 'low',
    gap2035: 'severe',
    note: 'Uranium ORE is diversified; the chokepoint is ENRICHMENT. Russia ~44% of world SWU; for HALEU (5–20% U-235) Centrus is the only Western producer, at demo scale — a textbook fuel-cycle single point of failure.',
  }),
};

export function processingFor(commodityId: string): ProcessingConcentration | null {
  return PROCESSING[commodityId] ?? null;
}

// Layer label + short descriptor for UI grouping.
export const LAYER_META: Record<1 | 2 | 3, { label: string; short: string }> = {
  1: { label: 'Layer 1 — Mineral processing & separation', short: 'Processing' },
  2: { label: 'Layer 2 — Heavy industrial equipment', short: 'Equipment' },
  3: { label: 'Layer 3 — Fuel-cycle & feedstock SPOF', short: 'Fuel cycle' },
};
