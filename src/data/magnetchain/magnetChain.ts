import type { MagnetChainStage, MagnetRoute } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Source-to-finished-magnet supply chain.
//
// Traces a kilogram of sintered NdFeB magnet from rare-earth ore to a coated,
// magnetised magnet on the open market — the stages, the cost each adds, the
// companies and countries that dominate it, and China's share. The chain's
// decisive truth (per the ChokepointMacro magnet briefings): the magnet, not the
// mine, is the chokepoint — China holds ~90% of separation and ~90–94% of
// magnet-making, and the heavy rare earths (Dy/Tb) the best grades need are the
// scarcest, most export-controlled inputs.
//
// Concentration shares are SOURCED to the briefings (IEA / IDTechEx / MP); the
// per-stage USD/kg cost contributions are MODELED illustrative splits of a
// representative ~$75/kg finished sintered-NdFeB value (DATA_GAPS DATA-MAGCOST-1).
// ─────────────────────────────────────────────────────────────────────────────

export const MAGNET_CHAIN_SOURCE = 'ChokepointMacro — Rare Earth Magnets / Value Chain (Jun 2026)';
export const MAGNET_CHAIN_SOURCE_URL =
  'https://www.iea.org/reports/global-critical-minerals-outlook-2025';

export const MAGNET_CHAIN: MagnetChainStage[] = [
  {
    id: 'mining',
    order: 1,
    stage: 'Mining',
    description:
      'Rare-earth ore (bastnäsite, monazite, ionic-adsorption clay) is mined and milled to a mixed RE concentrate. Ore is geologically abundant — this is the LEAST concentrated step.',
    output: 'Mixed rare-earth concentrate (REO)',
    costUsdPerKg: 8,
    chinaSharePct: 70,
    dominantCompanies: ['China Northern RE', 'MP Materials (Mountain Pass)', 'Lynas (Mt Weld)'],
    dominantCountries: ['China', 'United States', 'Australia', 'Myanmar'],
  },
  {
    id: 'separation',
    order: 2,
    stage: 'Separation',
    description:
      'Solvent-extraction separation of the mixed concentrate into individual high-purity oxides (NdPr, and the scarce heavy REs Dy/Tb). The chemistry- and capital-intensive chokepoint — China ~90%.',
    output: 'Separated oxides: NdPr, Dy, Tb',
    costUsdPerKg: 14,
    chinaSharePct: 90,
    dominantCompanies: ['China Northern/Southern RE', 'Lynas (Malaysia/Texas)', 'Energy Fuels'],
    dominantCountries: ['China', 'Malaysia', 'United States'],
    exportControlled: true,
  },
  {
    id: 'metal_alloy',
    order: 3,
    stage: 'Metal & alloy',
    description:
      'Reduction of oxide to rare-earth metal, then strip-casting into NdFeB master alloy (Nd₂Fe₁₄B phase, ~29–32% Nd/Pr, ~64–69% Fe, ~1.1% B, plus Dy/Tb/Co/Cu/Nb). China-dominated.',
    output: 'Strip-cast NdFeB alloy',
    costUsdPerKg: 12,
    chinaSharePct: 90,
    dominantCompanies: ['China RE metal/alloy makers', 'Less Common Metals (UK)', 'MP Materials'],
    dominantCountries: ['China', 'United Kingdom', 'United States'],
  },
  {
    id: 'magnet_making',
    order: 4,
    stage: 'Magnet-making',
    description:
      'Powder metallurgy: hydrogen decrepitation → jet mill → align/press → sinter → grain-boundary diffusion (Dy/Tb) → machine → coat (NiCuNi) → magnetise. Deep process know-how + qualification — China ~90–94%, the true chokepoint.',
    output: 'Coated, magnetised NdFeB magnet (e.g. N42SH)',
    costUsdPerKg: 33,
    chinaSharePct: 92,
    dominantCompanies: ['JL MAG', 'Zhenghai', 'Ningbo Yunsheng', 'Shin-Etsu', 'TDK', 'Proterial', 'VAC', 'MP Materials'],
    dominantCountries: ['China', 'Japan', 'Germany', 'United States'],
    exportControlled: true,
  },
  {
    id: 'open_market',
    order: 5,
    stage: 'Open market',
    description:
      'Finished magnets sold by grade (number = strength MGOe; letter suffix = heat class via Dy/Tb) into EV traction (~2 kg/car), direct-drive wind (~500–700 kg/MW), robotics, electronics and defence. Market ~$22B (2025) → ~$30B (2030).',
    output: 'Graded magnets to OEMs (EV, wind, robotics, defence)',
    costUsdPerKg: 8,
    chinaSharePct: 90,
    dominantCompanies: ['Chinese magnet exporters', 'Western OEM supply (MP/VAC/Neo)'],
    dominantCountries: ['China', 'Global OEMs'],
  },
];

// Geographic routes for the map: the dominant ~90% China path and the emerging
// Western (MP) path. Coordinates are approximate facility/hub locations.
export const MAGNET_ROUTES: MagnetRoute[] = [
  {
    id: 'china_route',
    label: 'Dominant China route (~90%)',
    color: '#dc2626',
    dominant: true,
    note: 'Ore (incl. imported Australian/US/Myanmar feed) → Chinese separation → Chinese alloy & magnet-making → exported to global OEMs. ~90% of the chain sits inside China.',
    nodes: [
      { name: 'Bayan Obo (mining)', country: 'China', lng: 109.97, lat: 41.78 },
      { name: 'Ganzhou (separation)', country: 'China', lng: 114.93, lat: 25.83 },
      { name: 'Ningbo (alloy + magnets)', country: 'China', lng: 121.55, lat: 29.87 },
      { name: 'Global OEMs (market)', country: 'Germany', lng: 9.0, lat: 50.5 },
    ],
  },
  {
    id: 'western_route',
    label: 'Emerging Western route (MP)',
    color: '#0d9488',
    dominant: false,
    note: 'Mountain Pass ore + separation → Fort Worth sintered NdFeB → U.S. OEM (GM). The first mine-to-magnet chain outside China, still <10% of supply.',
    nodes: [
      { name: 'Mountain Pass (mine + separation)', country: 'United States', lng: -115.53, lat: 35.48 },
      { name: 'Independence, Fort Worth (magnets)', country: 'United States', lng: -97.33, lat: 32.75 },
      { name: 'GM / U.S. OEMs (market)', country: 'United States', lng: -83.05, lat: 42.33 },
    ],
  },
];

export function totalMagnetCostUsdPerKg(): number {
  return MAGNET_CHAIN.reduce((s, x) => s + x.costUsdPerKg, 0);
}

// Share of total cost added downstream of (and including) the separation step —
// i.e. the midstream-and-beyond value that China captures.
export function midstreamCostSharePct(): number {
  const total = totalMagnetCostUsdPerKg();
  const midstream = MAGNET_CHAIN.filter((s) => s.order >= 2).reduce((s, x) => s + x.costUsdPerKg, 0);
  return Math.round((midstream / total) * 100);
}
