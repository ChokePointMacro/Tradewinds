import type { GapRisk, Substitutability } from '@/types';
import { processingFor } from '@/data/processing/processingConcentration';

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic, technology-aware criticality (Recommendation 4).
//
// A mineral's criticality is NOT fixed. The report's core substitution insight:
// sodium-ion erodes lithium/graphite/cobalt risk; acid-free recycling erodes
// primary NdPr risk; DLE changes lithium supply speed; ex-China by-product
// recovery erodes gallium/germanium risk; enrichment scale-up erodes HALEU risk.
//
// This turns the static 2026 criticality SNAPSHOT into a forward CURVE: a base
// score (0–100, higher = more critical) built from the processing-concentration
// register, then time-phased modifiers from substitution/recycling/diversifi-
// cation technologies that bend the curve DOWN on an explicit, cited timeline.
//
// The base is grounded in SOURCED concentration figures; the curve itself is a
// MODELED forward projection (scenario, not forecast) — badge it MODELED.
// ─────────────────────────────────────────────────────────────────────────────

export const CRITICALITY_YEARS = [2026, 2028, 2030, 2032, 2035] as const;

export interface CriticalityPoint {
  year: number;
  criticality: number; // 0–100
}

// A substitution / recycling / diversification lever that lowers criticality,
// ramping linearly from `startYear` (no effect) to `fullYear` (full `maxDeltaPct`).
export interface CriticalityModifier {
  driver: string; // the technology / lever
  advancementRank?: number; // report Section-5 advancement #
  startYear: number;
  fullYear: number;
  maxDeltaPct: number; // total reduction applied to base criticality at fullYear
}

export interface CriticalityCurve {
  commodityId: string;
  base: number; // 2026 criticality
  end: number; // 2035 criticality
  curve: CriticalityPoint[];
  modifiers: CriticalityModifier[];
}

const SUB_SCORE: Record<Substitutability, number> = {
  very_low: 25,
  low: 18,
  medium: 8,
  high: 0,
};
const GAP_SCORE: Record<GapRisk, number> = {
  severe: 22,
  high: 14,
  medium: 7,
  low: 0,
};

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

// Base 2026 criticality from the midstream concentration register: the leading
// processor's share dominates, lifted by low substitutability, a hard 2035 gap,
// and an active export-control lever.
export function baseCriticality(commodityId: string): number | null {
  const p = processingFor(commodityId);
  if (!p) return null;
  return clamp(
    0.45 * p.sharePct +
      SUB_SCORE[p.substitutability] +
      GAP_SCORE[p.gap2035] +
      (p.exportControlled ? 8 : 0),
  );
}

// Substitution / recycling / diversification levers per commodity, each tied to
// a report advancement. These are the technologies whose maturation LOWERS the
// contested mineral's criticality over the 2026–2035 window.
const MODIFIERS: Record<string, CriticalityModifier[]> = {
  lithium: [
    { driver: 'Sodium-ion maturation (low-cost hard-carbon anode)', advancementRank: 4, startYear: 2026, fullYear: 2029, maxDeltaPct: 12 },
    { driver: 'Direct lithium extraction (DLE)', advancementRank: 8, startYear: 2026, fullYear: 2031, maxDeltaPct: 7 },
  ],
  graphite: [
    { driver: 'Sodium-ion hard-carbon + silicon anodes', advancementRank: 4, startYear: 2026, fullYear: 2030, maxDeltaPct: 15 },
    { driver: 'Anode-graphite recycling (black-mass)', advancementRank: 7, startYear: 2026, fullYear: 2032, maxDeltaPct: 6 },
  ],
  cobalt: [
    { driver: 'LFP / sodium-ion chemistry shift (designs cobalt out)', advancementRank: 4, startYear: 2026, fullYear: 2029, maxDeltaPct: 18 },
    { driver: 'Battery recycling (black-mass cobalt recovery)', advancementRank: 7, startYear: 2026, fullYear: 2032, maxDeltaPct: 6 },
  ],
  manganese: [
    { driver: 'Sodium-ion maturation (avoids battery-grade Mn)', advancementRank: 4, startYear: 2026, fullYear: 2029, maxDeltaPct: 9 },
  ],
  neodymium: [
    { driver: 'Acid-free NdPr magnet recycling', advancementRank: 7, startYear: 2026, fullYear: 2032, maxDeltaPct: 12 },
    { driver: 'Modular REE separation (ionic liquids / DES)', advancementRank: 1, startYear: 2026, fullYear: 2032, maxDeltaPct: 6 },
  ],
  re_compounds: [
    { driver: 'Modular REE separation (ionic liquids / DES)', advancementRank: 1, startYear: 2026, fullYear: 2032, maxDeltaPct: 10 },
    { driver: 'Magnet & black-mass recycling', advancementRank: 7, startYear: 2026, fullYear: 2032, maxDeltaPct: 6 },
  ],
  ndfeb_magnets: [
    { driver: 'Commercial magnet recycling (closed loop)', advancementRank: 7, startYear: 2026, fullYear: 2032, maxDeltaPct: 12 },
    { driver: 'Ferrite / iron-nitride magnet substitution (inferior)', startYear: 2030, fullYear: 2035, maxDeltaPct: 4 },
  ],
  dysprosium: [
    { driver: 'Grain-boundary diffusion (reduced-Dy magnets) + recycling', advancementRank: 7, startYear: 2028, fullYear: 2035, maxDeltaPct: 7 },
  ],
  gallium: [
    { driver: 'Ex-China by-product recovery (re-engineered alumina refineries)', advancementRank: 6, startYear: 2027, fullYear: 2033, maxDeltaPct: 9 },
  ],
  germanium: [
    { driver: 'Ex-China by-product recovery (from zinc) + fiber recycling', advancementRank: 6, startYear: 2027, fullYear: 2033, maxDeltaPct: 9 },
  ],
  uranium: [
    { driver: 'HALEU enrichment at scale (Centrus + laser enrichment)', advancementRank: 2, startYear: 2027, fullYear: 2033, maxDeltaPct: 14 },
  ],
  polysilicon: [
    { driver: 'Ex-China polysilicon capacity (US/EU/Gulf build-out)', startYear: 2026, fullYear: 2030, maxDeltaPct: 8 },
  ],
  tungsten: [
    { driver: 'Tungsten scrap recycling (low substitutability ceiling)', startYear: 2028, fullYear: 2035, maxDeltaPct: 4 },
  ],
  copper: [
    { driver: 'Secondary copper / scrap recycling (no true substitute)', startYear: 2028, fullYear: 2035, maxDeltaPct: 5 },
  ],
};

function modifierAt(m: CriticalityModifier, year: number): number {
  if (year <= m.startYear) return 0;
  if (year >= m.fullYear) return m.maxDeltaPct;
  const frac = (year - m.startYear) / (m.fullYear - m.startYear);
  return m.maxDeltaPct * frac;
}

/**
 * Forward criticality curve for a commodity. Returns null when there is no
 * midstream entry to anchor a base score (we never fabricate criticality).
 */
export function criticalityCurve(commodityId: string): CriticalityCurve | null {
  const base = baseCriticality(commodityId);
  if (base === null) return null;
  const modifiers = MODIFIERS[commodityId] ?? [];

  const curve: CriticalityPoint[] = CRITICALITY_YEARS.map((year) => {
    const reduction = modifiers.reduce((s, m) => s + modifierAt(m, year), 0);
    return { year, criticality: Math.round(clamp(base - reduction)) };
  });

  return {
    commodityId,
    base: Math.round(base),
    end: curve[curve.length - 1]!.criticality,
    curve,
    modifiers,
  };
}

export type CriticalityBand = 'low' | 'elevated' | 'high' | 'severe';

export function criticalityBand(score: number): CriticalityBand {
  if (score >= 80) return 'severe';
  if (score >= 60) return 'high';
  if (score >= 40) return 'elevated';
  return 'low';
}
