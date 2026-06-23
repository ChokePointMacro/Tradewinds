import type { Technology, DemandWave } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Technology → Mineral → Processing bill-of-materials (Recommendation 2).
//
// Links each emerging demand-driver technology to the minerals AND the specific
// processing steps it depends on, each tagged with concentration / substitut-
// ability / 2035 gap. This converts the static report library into a queryable,
// demand-driven risk tool: "if technology X scales, which choke points tighten?"
//
// `advancementRank`, `maturity`, `scaleWindow` mirror the report's Section-5
// "advancements that must mature" table; `bom` rows draw on the Section-7
// critical-minerals matrix and the per-sector mineral lists. SOURCED-shaped to
// the report (IEA / USGS); re-verify before investment use (DATA_GAPS DATA-PROC-1).
// ─────────────────────────────────────────────────────────────────────────────

const REPORT = {
  source: 'ChokepointMacro — The Twenty-Year Bottleneck (Jun 2026), §3/§5/§7',
  sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025',
};

export const DEMAND_WAVES: Record<DemandWave, { label: string; short: string }> = {
  ai_compute: { label: 'AI compute & semiconductors', short: 'AI compute' },
  electrification: { label: 'Electrification of everything', short: 'Electrification' },
  firm_power: { label: 'Firm power & energy transition', short: 'Firm power' },
  defense: { label: 'Defense & sovereignty', short: 'Defense' },
  physical_ai: { label: 'Physical AI (robotics, eVTOL)', short: 'Physical AI' },
};

function tech(t: Omit<Technology, 'source' | 'sourceUrl'>): Technology {
  return { ...t, source: REPORT.source, sourceUrl: REPORT.sourceUrl };
}

export const TECHNOLOGIES: Technology[] = [
  tech({
    id: 'ndfeb_motors',
    name: 'NdFeB permanent-magnet motors',
    sector: 'Permanent magnets & motors (cross-cutting)',
    waves: ['electrification', 'firm_power', 'defense', 'physical_ai'],
    thesis: 'The magnets that turn electricity into motion — EVs, wind, robotics, precision munitions.',
    advancementRank: 1,
    relieves: 'The #1 REE/magnet chokepoint',
    maturity: 'mature_capacity_short',
    scaleWindow: '2026–2032',
    bom: [
      { commodityId: 'neodymium', mineral: 'NdPr', role: 'Primary magnet rare earth', processingStep: 'Solvent-extraction separation', concentration: 'China ~90% separation', substitutability: 'low', gap2035: 'severe' },
      { commodityId: 'dysprosium', mineral: 'Dy / Tb', role: 'High-temperature coercivity', processingStep: 'Heavy-REE separation', concentration: 'China dominant; scarcer', substitutability: 'very_low', gap2035: 'severe' },
      { commodityId: 'ndfeb_magnets', mineral: 'Sintered magnet', role: 'Finished magnet', processingStep: 'Sintering & magnet-making', concentration: 'China ~90–94%', substitutability: 'low', gap2035: 'severe' },
    ],
  }),
  tech({
    id: 'haleu_smr',
    name: 'SMRs & the HALEU fuel cycle',
    sector: 'Nuclear: SMRs, fuel cycle & fusion',
    waves: ['firm_power', 'ai_compute'],
    thesis: 'AI’s demand for firm 24/7 power makes SMRs the marquee energy story — gated by HALEU fuel.',
    advancementRank: 2,
    relieves: 'Nuclear / SMR fuel single-point-of-failure',
    maturity: 'demo',
    scaleWindow: '2027–2033',
    bom: [
      { commodityId: 'uranium', mineral: 'HALEU (5–20% U-235)', role: 'Advanced-reactor fuel', processingStep: 'Enrichment (SWU / HALEU)', concentration: 'Russia/China at scale; 1 Western (Centrus)', substitutability: 'low', gap2035: 'severe' },
      { commodityId: '', mineral: 'TRISO / fuel fabrication', role: 'Coated-particle fuel forms', processingStep: 'Fuel fabrication (thin capacity)', concentration: 'Nascent ex-Russia', substitutability: 'low', gap2035: 'high' },
    ],
  }),
  tech({
    id: 'grid_transformers',
    name: 'HV transformers & grid equipment',
    sector: 'Electric grid & heavy electrical equipment',
    waves: ['ai_compute', 'electrification', 'firm_power'],
    thesis: 'The grid is the master constraint of the AI era — transformers are the single most-cited gating item.',
    advancementRank: 3,
    relieves: 'Grid / AI power chokepoint',
    maturity: 'mature_capacity_short',
    scaleWindow: '2026–2032',
    bom: [
      { commodityId: 'copper', mineral: 'Copper', role: 'Windings & cabling', processingStep: 'Smelting & refining', concentration: 'China ~40%+ smelting', substitutability: 'low', gap2035: 'high' },
      { commodityId: '', mineral: 'Grain-oriented electrical steel', role: 'Transformer core', processingStep: 'GOES rolling (concentrated)', concentration: 'China-heavy; capacity-short', substitutability: 'low', gap2035: 'high' },
      { commodityId: '', mineral: 'Amorphous metals', role: 'Efficient cores', processingStep: 'Ribbon casting', concentration: 'Niche', substitutability: 'medium', gap2035: 'medium' },
    ],
  }),
  tech({
    id: 'sodium_ion',
    name: 'Sodium-ion batteries',
    sector: 'Batteries & energy storage',
    waves: ['electrification', 'firm_power'],
    thesis: 'A strategic hedge that REDUCES exposure to lithium, cobalt, nickel and graphite.',
    advancementRank: 4,
    relieves: 'Lithium / graphite / cobalt exposure',
    maturity: 'early_commercial',
    scaleWindow: '2026–2029',
    isSubstitution: true,
    bom: [
      { commodityId: '', mineral: 'Hard carbon (anode)', role: 'Key cost/performance bottleneck', processingStep: 'Biomass-derived hard-carbon', concentration: 'Maturing', substitutability: 'medium', gap2035: 'medium' },
      { commodityId: '', mineral: 'Sodium / Prussian-white', role: 'Cathode & charge carrier', processingStep: 'Abundant feedstock', concentration: 'Diversified', substitutability: 'high', gap2035: 'low' },
    ],
  }),
  tech({
    id: 'solid_state',
    name: 'Solid-state / silicon-anode batteries',
    sector: 'Batteries & energy storage',
    waves: ['electrification', 'physical_ai'],
    thesis: 'Energy-density frontier (>300–500 Wh/kg) — dendrites & manufacturability still unsolved at scale.',
    advancementRank: 5,
    relieves: 'Energy density; some mineral mix',
    maturity: 'pilot',
    scaleWindow: '2028–2035',
    bom: [
      { commodityId: 'lithium', mineral: 'Lithium metal', role: 'Anode (3,860 mAh/g)', processingStep: 'Chemical conversion', concentration: 'China >60% refined', substitutability: 'medium', gap2035: 'high' },
      { commodityId: '', mineral: 'Silicon', role: 'Silicon anode', processingStep: 'Specialty processing', concentration: 'Diversified', substitutability: 'high', gap2035: 'low' },
    ],
  }),
  tech({
    id: 'wide_bandgap',
    name: 'Wide-bandgap power electronics (SiC / GaN)',
    sector: 'AI compute & power electronics',
    waves: ['ai_compute', 'electrification', 'firm_power'],
    thesis: 'Power conversion for data-center PSUs, EV inverters and the grid — substrate yield still maturing.',
    advancementRank: 9,
    relieves: 'Conversion efficiency; grid / EV / DC',
    maturity: 'early_commercial',
    scaleWindow: '2026–2032',
    bom: [
      { commodityId: 'gallium', mineral: 'Gallium (GaN)', role: 'Wide-bandgap substrate', processingStep: 'Gallium recovery & refining', concentration: 'China ~99%', substitutability: 'low', gap2035: 'severe' },
      { commodityId: '', mineral: 'Silicon carbide', role: 'SiC substrate', processingStep: 'Crystal growth (low yield)', concentration: 'Maturing', substitutability: 'medium', gap2035: 'medium' },
    ],
  }),
  tech({
    id: 'advanced_packaging',
    name: 'Advanced packaging & AI accelerators',
    sector: 'AI compute & semiconductors',
    waves: ['ai_compute'],
    thesis: 'The frontier moved from transistor scaling to chiplets, HBM and power delivery into dense racks.',
    advancementRank: 14,
    relieves: 'Compute scaling',
    maturity: 'early_commercial',
    scaleWindow: '2025–2030',
    bom: [
      { commodityId: 'gallium', mineral: 'Gallium', role: 'Compound semis / optics', processingStep: 'Recovery & refining', concentration: 'China ~99%', substitutability: 'low', gap2035: 'severe' },
      { commodityId: 'germanium', mineral: 'Germanium', role: 'Fiber / optics / IR', processingStep: 'Recovery & refining', concentration: 'China ~60%', substitutability: 'low', gap2035: 'high' },
      { commodityId: 'copper', mineral: 'Copper', role: 'Interconnect & power', processingStep: 'Smelting & refining', concentration: 'China ~40%+ smelting', substitutability: 'low', gap2035: 'high' },
      { commodityId: '', mineral: 'High-purity quartz / neon', role: 'Lithography consumables', processingStep: 'Ultra-pure processing', concentration: 'Concentrated SPOF', substitutability: 'low', gap2035: 'high' },
    ],
  }),
  tech({
    id: 'magnet_battery_recycling',
    name: 'Magnet & battery recycling',
    sector: 'Circular supply (cross-cutting)',
    waves: ['electrification', 'defense', 'physical_ai'],
    thesis: 'Acid-free NdPr recovery and black-mass recycling relieve PRIMARY demand and close the loop.',
    advancementRank: 7,
    relieves: 'Primary-demand relief; closed loop',
    maturity: 'early_commercial',
    scaleWindow: '2026–2032',
    isSubstitution: true,
    bom: [
      { commodityId: 'ndfeb_magnets', mineral: 'Recovered NdFeB', role: 'Secondary magnet feed', processingStep: 'Acid-free NdPr recovery', concentration: 'Emerging ex-China', substitutability: 'medium', gap2035: 'medium' },
      { commodityId: 'cobalt', mineral: 'Black-mass Co/Ni/Li', role: 'Secondary battery metals', processingStep: 'Hydromet black-mass', concentration: 'Scaling', substitutability: 'medium', gap2035: 'medium' },
    ],
  }),
  tech({
    id: 'lfp_lmfp',
    name: 'LFP / LMFP mass-market cells',
    sector: 'Batteries & energy storage',
    waves: ['electrification', 'firm_power'],
    thesis: 'The volume leaders (LFP ~81% of China EV installs early-2026) — avoid nickel and cobalt entirely.',
    maturity: 'early_commercial',
    scaleWindow: '2025–2030',
    isSubstitution: true,
    bom: [
      { commodityId: 'lithium', mineral: 'Lithium', role: 'Charge carrier', processingStep: 'Chemical conversion', concentration: 'China >60% refined', substitutability: 'medium', gap2035: 'high' },
      { commodityId: 'graphite', mineral: 'Graphite', role: 'Anode', processingStep: 'Spherical anode processing', concentration: 'China ~80%', substitutability: 'medium', gap2035: 'high' },
    ],
  }),
  tech({
    id: 'long_duration_storage',
    name: 'Long-duration storage (iron-air / flow)',
    sector: 'Energy storage',
    waves: ['firm_power'],
    thesis: 'Firms renewables and relieves peak/grid stress with abundant, non-contested chemistries.',
    advancementRank: 10,
    relieves: 'Firms renewables; relieves peak/grid',
    maturity: 'early_commercial',
    scaleWindow: '2027–2034',
    isSubstitution: true,
    bom: [
      { commodityId: '', mineral: 'Iron', role: 'Iron-air active material', processingStep: 'Abundant', concentration: 'Diversified', substitutability: 'high', gap2035: 'low' },
      { commodityId: '', mineral: 'Vanadium', role: 'Flow-battery electrolyte', processingStep: 'Refining', concentration: 'China/Russia-heavy', substitutability: 'medium', gap2035: 'medium' },
    ],
  }),
];

export function technologyById(id: string): Technology | undefined {
  return TECHNOLOGIES.find((t) => t.id === id);
}

// All technologies whose bill of materials leans on a given commodity — powers
// the reverse lens ("which technologies pull on this mineral?").
export function technologiesForCommodity(commodityId: string): Technology[] {
  return TECHNOLOGIES.filter((t) => t.bom.some((b) => b.commodityId === commodityId));
}
