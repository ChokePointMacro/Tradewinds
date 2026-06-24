import type { InnovationVenture, VentureCategory, VentureStage } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Innovations & Ventures tracker.
//
// The companies and flagship projects racing to break the processing /
// manufacturing chokepoints the ChokepointMacro reports identify — rare-earth
// separation, NdFeB & SmCo magnet-making, HALEU enrichment, advanced reactors,
// next-gen batteries, and recycling — with stage, ownership, financing and the
// latest milestones.
//
// Concentration, capacity and milestone facts are SOURCED to the ChokepointMacro
// "Twenty-Year Bottleneck" and "Rare Earth Magnets — The End Product" briefings
// (Jun 2026) and the named companies' public disclosures. Financing figures are
// point-in-time public deal values; treat as indicative and re-verify (see
// DATA_GAPS DATA-VENT-1). Where a figure isn't disclosed it is omitted, not
// estimated.
// ─────────────────────────────────────────────────────────────────────────────

const REPORTS = {
  source: 'ChokepointMacro briefings (Jun 2026) + company disclosures',
  sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025',
};

export const CATEGORY_META: Record<VentureCategory, { label: string; chip: string; dot: string }> = {
  separation: { label: 'Separation', chip: 'bg-violet-100 text-violet-800 border-violet-300', dot: '#7c3aed' },
  magnets: { label: 'Magnets', chip: 'bg-teal-100 text-teal-800 border-teal-300', dot: '#0d9488' },
  enrichment: { label: 'HALEU / fuel cycle', chip: 'bg-amber-100 text-amber-800 border-amber-300', dot: '#d97706' },
  reactor: { label: 'Advanced reactor', chip: 'bg-orange-100 text-orange-800 border-orange-300', dot: '#ea580c' },
  battery: { label: 'Battery', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: '#059669' },
  recycling: { label: 'Recycling', chip: 'bg-lime-100 text-lime-800 border-lime-300', dot: '#65a30d' },
  mining_dle: { label: 'Mining / DLE', chip: 'bg-sky-100 text-sky-800 border-sky-300', dot: '#0284c7' },
};

export const STAGE_META: Record<VentureStage, { label: string; rank: number }> = {
  research: { label: 'Research', rank: 0 },
  pilot: { label: 'Pilot', rank: 1 },
  demo: { label: 'Demonstration', rank: 2 },
  construction: { label: 'Under construction', rank: 3 },
  early_commercial: { label: 'Early commercial', rank: 4 },
  commercial: { label: 'Commercial', rank: 5 },
};

function v(x: Omit<InnovationVenture, 'source' | 'sourceUrl'>): InnovationVenture {
  return { ...x, source: REPORTS.source, sourceUrl: REPORTS.sourceUrl };
}

export const VENTURES: InnovationVenture[] = [
  v({
    id: 'mp_independence',
    name: 'Independence (sintered NdFeB)',
    company: 'MP Materials',
    ticker: 'NYSE: MP',
    category: 'magnets',
    advancementRank: 1,
    thesis: 'First commercial U.S. sintered-NdFeB magnets in decades; the anchor of a Western magnet chain from mine (Mountain Pass) to finished magnet.',
    stage: 'early_commercial',
    country: 'United States',
    location: 'Fort Worth, Texas',
    ownership: 'Public; strategic backing from the U.S. DoD (largest shareholder via preferred + warrants), GM and Apple.',
    capacity: '~1,000 → 3,000 MT/yr; +7,000 MT/yr "10X" plant (Northlake, TX) → ~10,000 MT/yr',
    funding: [
      { label: 'DoD equity + price floor', kind: 'government', amountUsdB: 0.4, year: 2025, note: '$110/kg NdPr floor; DoD becomes largest shareholder' },
      { label: 'Apple recycling prepay', kind: 'offtake', amountUsdB: 0.5, year: 2025, note: 'recycled-magnet supply agreement' },
      { label: 'GM offtake', kind: 'offtake', note: 'traction-magnet supply' },
      { label: 'Bank financing (10X plant)', kind: 'debt', amountUsdB: 1.0, year: 2025 },
    ],
    updates: [
      { dateISO: '2025-07', note: 'DoD multi-billion deal: $110/kg NdPr price floor, equity stake, 10X magnet plant commitment.' },
      { dateISO: '2025-12', note: 'First commercial U.S. sintered NdFeB produced at Independence (Fort Worth).' },
    ],
  }),
  v({
    id: 'lynas',
    name: 'Lynas separation (Malaysia + Texas)',
    company: 'Lynas Rare Earths',
    ticker: 'ASX: LYC',
    category: 'separation',
    advancementRank: 1,
    thesis: 'The largest rare-earth separator outside China; the Seadrift (Texas) plant is DoD-funded to add heavy-REE (Dy/Tb) separation on U.S. soil.',
    stage: 'commercial',
    country: 'Australia',
    location: 'Mt Weld (mine) · Kuantan, Malaysia · Seadrift, Texas',
    ownership: 'Public; U.S. DoD funding for the Texas heavy-rare-earth facility.',
    capacity: 'NdPr at scale; Dy/Tb separation commissioning',
    funding: [
      { label: 'DoD heavy-REE grant (Texas)', kind: 'government', amountUsdB: 0.26, note: 'light + heavy separation' },
    ],
    updates: [
      { dateISO: '2025-05', note: 'First heavy-rare-earth (Dy) separated outside China at Malaysia plant.' },
      { dateISO: '2026-01', note: 'Texas separation facility progressing under DoD support.' },
    ],
  }),
  v({
    id: 'vacuumschmelze',
    name: 'e-VAC Magnetics (US plant)',
    company: 'Vacuumschmelze (VAC)',
    category: 'magnets',
    advancementRank: 1,
    thesis: 'German magnet leader building a U.S. NdFeB plant to supply GM — Western magnet capacity with deep grain-boundary-diffusion/thrifting know-how.',
    stage: 'construction',
    country: 'Germany',
    location: 'Hanau, Germany · Sumter, South Carolina',
    ownership: 'Private (VAC); GM long-term offtake underwriting the U.S. plant.',
    capacity: 'South Carolina plant ramping toward EV-scale output',
    funding: [
      { label: 'GM offtake', kind: 'offtake', note: 'anchors the U.S. plant' },
      { label: 'DOE / IRA support', kind: 'government', note: 'advanced-manufacturing incentives' },
    ],
    updates: [
      { dateISO: '2025-09', note: 'South Carolina NdFeB plant under construction; GM-backed.' },
    ],
  }),
  v({
    id: 'neo_estonia',
    name: 'Neo Narva (sintered NdFeB)',
    company: 'Neo Performance Materials',
    ticker: 'TSX: NEO',
    category: 'magnets',
    advancementRank: 1,
    thesis: 'European sintered-NdFeB capacity (Estonia) plus the Magnequench bonded-magnet/MQ-powder lineage — the ex-China bonded-magnet standard.',
    stage: 'early_commercial',
    country: 'Estonia',
    location: 'Narva, Estonia',
    ownership: 'Public; European OEM offtake.',
    capacity: 'First sintered-magnet line in Europe ramping',
    funding: [
      { label: 'EU strategic-project support', kind: 'government', note: 'CRMA-aligned' },
    ],
    updates: [
      { dateISO: '2025-06', note: 'Narva sintered-NdFeB plant commissioned — first at-scale EU magnet line.' },
    ],
  }),
  v({
    id: 'usa_rare_earth',
    name: 'USA Rare Earth (Stillwater)',
    company: 'USA Rare Earth',
    ticker: 'NASDAQ: USAR',
    category: 'magnets',
    advancementRank: 1,
    thesis: 'Vertically-integrated magnet ambition (Round Top heavy-REE resource → Stillwater magnet plant) targeting the full ex-China NdFeB stack.',
    stage: 'construction',
    country: 'United States',
    location: 'Stillwater, Oklahoma',
    ownership: 'Public (de-SPAC); private + strategic investors.',
    capacity: 'Phase-1 magnet line; target ~5,000 MT/yr',
    funding: [
      { label: 'Equity (public + private)', kind: 'equity', note: 'de-SPAC proceeds' },
    ],
    updates: [
      { dateISO: '2025-10', note: 'Stillwater magnet plant building out first sintered-NdFeB line.' },
    ],
  }),
  v({
    id: 'energy_fuels',
    name: 'White Mesa REE (monazite)',
    company: 'Energy Fuels',
    ticker: 'NYSE: UUUU',
    category: 'separation',
    thesis: 'Uranium mill pivoting to rare-earth separation from monazite — a dual fuel-cycle + REE play on existing licensed infrastructure.',
    stage: 'early_commercial',
    country: 'United States',
    location: 'White Mesa, Utah',
    ownership: 'Public; uranium + REE diversified.',
    capacity: 'NdPr oxide; heavy-REE separation pilot',
    funding: [
      { label: 'Internal cash flow + equity', kind: 'equity' },
    ],
    updates: [
      { dateISO: '2025-08', note: 'Producing separated NdPr; advancing Dy/Tb circuit.' },
    ],
  }),
  v({
    id: 'centrus',
    name: 'American Centrifuge (HALEU)',
    company: 'Centrus Energy',
    ticker: 'NYSE: LEU',
    category: 'enrichment',
    advancementRank: 2,
    thesis: 'The only Western HALEU producer — the single point of failure for advanced-reactor fuel; scaling from demonstration toward commercial cascades.',
    stage: 'demo',
    country: 'United States',
    location: 'Piketon, Ohio',
    ownership: 'Public; DOE HALEU contracts.',
    capacity: 'Demo cascade; expansion to ~900 MT SWU planned',
    funding: [
      { label: 'DOE HALEU contracts', kind: 'government', note: 'phased awards' },
    ],
    updates: [
      { dateISO: '2025-11', note: 'Continued HALEU deliveries to DOE; expansion pending offtake certainty.' },
    ],
  }),
  v({
    id: 'lis_tech',
    name: 'Laser enrichment (Oak Ridge)',
    company: 'LIS Technologies',
    category: 'enrichment',
    advancementRank: 2,
    thesis: 'Laser-isotope-separation HALEU — a potential lower-cost enrichment route to break the Russia/China hold on the fuel cycle.',
    stage: 'pilot',
    country: 'United States',
    location: 'Oak Ridge, Tennessee',
    ownership: 'Private; DOE-adjacent siting.',
    capacity: 'Pilot → ~$1.38B planned plant',
    funding: [
      { label: 'Planned plant (DOE pathway)', kind: 'government', amountUsdB: 1.38, note: 'Oak Ridge laser-enrichment plan' },
    ],
    updates: [
      { dateISO: '2026-01', note: 'Advancing laser-enrichment pilot; ~$1.38B Oak Ridge plan disclosed.' },
    ],
  }),
  v({
    id: 'xenergy',
    name: 'Xe-100 + TX-1 HALEU fuel',
    company: 'X-energy',
    category: 'reactor',
    advancementRank: 2,
    thesis: 'Hyperscaler-backed (Amazon) SMR with its own TRISO/HALEU fuel fabrication — vertically integrating fuel to de-risk the HALEU bottleneck.',
    stage: 'construction',
    country: 'United States',
    location: 'TX-1 fuel fab · Dow Seadrift reactor site, Texas',
    ownership: 'Private; Amazon strategic equity.',
    capacity: 'Xe-100 (80 MWe modules); TX-1 HALEU/TRISO fab',
    funding: [
      { label: 'Amazon-led equity', kind: 'equity', amountUsdB: 0.5, year: 2024, note: 'Series round incl. Amazon' },
      { label: 'DOE ARDP', kind: 'government', note: 'advanced-reactor demonstration' },
    ],
    updates: [
      { dateISO: '2026-02', note: 'TX-1 HALEU fuel-fabrication facility received NRC Part 70 license.' },
    ],
  }),
  v({
    id: 'terrapower',
    name: 'Natrium (Kemmerer)',
    company: 'TerraPower',
    category: 'reactor',
    advancementRank: 2,
    thesis: 'Sodium-cooled fast reactor with molten-salt storage; a flagship HALEU offtaker whose schedule is gated by Western fuel supply.',
    stage: 'construction',
    country: 'United States',
    location: 'Kemmerer, Wyoming',
    ownership: 'Private; Gates-backed; DOE ARDP cost-share.',
    capacity: '345 MWe + storage',
    funding: [
      { label: 'DOE ARDP cost-share', kind: 'government', amountUsdB: 2.0, note: 'public-private demonstration' },
      { label: 'Private equity', kind: 'equity' },
    ],
    updates: [
      { dateISO: '2025-03', note: 'Non-nuclear construction underway; reactor build pending HALEU + NRC.' },
    ],
  }),
  v({
    id: 'oklo',
    name: 'Aurora powerhouse',
    company: 'Oklo',
    ticker: 'NYSE: OKLO',
    category: 'reactor',
    advancementRank: 2,
    thesis: 'Microreactor developer with a build-own-operate model and data-center offtake interest; HALEU-fuelled.',
    stage: 'demo',
    country: 'United States',
    location: 'Idaho National Laboratory',
    ownership: 'Public; data-center / hyperscaler interest.',
    capacity: 'Aurora ~15–50 MWe',
    funding: [
      { label: 'Public equity', kind: 'equity' },
      { label: 'DOE fuel + site access', kind: 'government' },
    ],
    updates: [
      { dateISO: '2025-12', note: 'Advancing licensing and first-plant siting at INL.' },
    ],
  }),
  v({
    id: 'catl_sodium',
    name: 'Naxtra sodium-ion',
    company: 'CATL',
    ticker: 'SZSE: 300750',
    category: 'battery',
    advancementRank: 4,
    thesis: 'Mass-market sodium-ion — a substitution lever that lowers lithium/graphite/cobalt criticality; cost parity with LFP projected ~2027.',
    stage: 'early_commercial',
    country: 'China',
    location: 'Multiple (China)',
    ownership: 'Public; the world’s largest cell maker.',
    capacity: 'GWh-scale sodium-ion; mass production targeted end-2026',
    funding: [
      { label: 'Internal capex', kind: 'equity' },
    ],
    updates: [
      { dateISO: '2025-04', note: 'Sodium-ion brand launched; GWh-scale offtake signed.' },
      { dateISO: '2026-01', note: 'Scaling toward end-2026 mass production.' },
    ],
  }),
  v({
    id: 'redwood',
    name: 'Battery recycling (black mass)',
    company: 'Redwood Materials',
    category: 'recycling',
    advancementRank: 7,
    thesis: 'Closed-loop battery-metal recovery (Li/Ni/Co) — secondary supply that bends primary demand and shortens the China-refined chain.',
    stage: 'early_commercial',
    country: 'United States',
    location: 'Nevada · South Carolina',
    ownership: 'Private; major automaker offtakes.',
    capacity: 'Anode/cathode-precursor scale-up',
    funding: [
      { label: 'DOE loan', kind: 'debt', amountUsdB: 2.0, note: 'conditional loan for cathode/anode' },
      { label: 'Private equity', kind: 'equity', amountUsdB: 1.0 },
    ],
    updates: [
      { dateISO: '2025-07', note: 'Ramping recycled cathode/anode output in Nevada + South Carolina.' },
    ],
  }),
  v({
    id: 'arnold_smco',
    name: 'SmCo for defence',
    company: 'Arnold Magnetic Technologies',
    category: 'magnets',
    thesis: 'Western samarium-cobalt for missiles, satellites and jet actuators — the heat/corrosion specialist whose Sm feedstock is being onshored (MP/Mountain Pass).',
    stage: 'commercial',
    country: 'United States',
    location: 'Rochester, New York',
    ownership: 'Private (Compass Diversified); defence offtake.',
    capacity: 'SmCo + precision magnet assemblies',
    funding: [
      { label: 'Defence contracts', kind: 'offtake', note: 'qualification-bound demand' },
    ],
    updates: [
      { dateISO: '2025-10', note: 'SmCo demand tied to MP samarium-separation onshoring under DoD agreement.' },
    ],
  }),
];

export function venturesByCategory(category: VentureCategory): InnovationVenture[] {
  return VENTURES.filter((x) => x.category === category);
}

// Total disclosed financing across a venture (USD billions), summing only the
// amounts that are actually reported.
export function disclosedFunding(venture: InnovationVenture): number {
  return venture.funding.reduce((s, f) => s + (f.amountUsdB ?? 0), 0);
}
