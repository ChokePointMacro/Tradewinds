import type { Commodity, SupplyChainStep } from '@/types';

// Critical minerals — the USGS/DOE critical-materials backbone. For several of
// these (lithium, cobalt, graphite) the binding chokepoint is NOT mining but
// downstream REFINING/CONVERSION, which is heavily concentrated in China (IEA
// Global Critical Minerals Outlook). The chain template therefore carries a
// distinct refining step with the dominant processor named.
//
// Prices: none have a free real-time feed — all benchmarks are paid (Benchmark
// Mineral Intelligence, Fastmarkets, Argus, LME, CRU, UxC) — so priceSymbol is
// empty and live price errors out under the source-or-error rule. Trade
// (Comtrade) and production/reserves (USGS MCS 2025 / WNA) are wired.

interface MineralChainOpts {
  miningLabel?: string;
  miningDesc: string;
  refineLabel: string;
  refineDesc: string;
  refineCountry: string;
  unit: 'tonne' | 'kg';
}

function mineralChain(id: string, o: MineralChainOpts): SupplyChainStep[] {
  return [
    {
      id: `${id}_mining`,
      order: 1,
      key: 'extraction',
      label: o.miningLabel ?? 'Mining',
      description: o.miningDesc,
      specifics: {},
      costParamKeys: [`${id}.mining`],
    },
    {
      id: `${id}_refining`,
      order: 2,
      key: 'refining',
      label: o.refineLabel,
      description: o.refineDesc,
      specifics: { dominantSupplier: o.refineCountry },
      costParamKeys: [`${id}.refining`],
    },
    {
      id: `${id}_logistics`,
      order: 3,
      key: 'storage',
      label: 'Logistics',
      description: 'Ocean/bulk freight and storage of the refined product.',
      specifics: {},
      costParamKeys: [`${id}.freight`],
    },
  ];
}

export const lithium: Commodity = {
  id: 'lithium',
  name: 'Lithium',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'Battery-grade Li₂CO₃ (Benchmark Mineral Intelligence)',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const cobalt: Commodity = {
  id: 'cobalt',
  name: 'Cobalt',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'LME Cobalt',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const graphite: Commodity = {
  id: 'graphite',
  name: 'Natural graphite',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'Flake graphite (Fastmarkets)',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const manganese: Commodity = {
  id: 'manganese',
  name: 'Manganese',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'Mn ore 44% CIF China (CRU)',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const titanium: Commodity = {
  id: 'titanium',
  name: 'Titanium',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'Titanium sponge (Fastmarkets)',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const tungsten: Commodity = {
  id: 'tungsten',
  name: 'Tungsten',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'APT, in-warehouse Rotterdam (Argus)',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const uranium: Commodity = {
  id: 'uranium',
  name: 'Uranium',
  category: 'critical_mineral',
  nativeUnit: 'tonne',
  benchmark: 'U₃O₈ spot (UxC)',
  priceSymbol: '',
  chainTemplateId: 'chain_mineral',
};

export const lithiumChain = mineralChain('lithium', {
  miningDesc: 'Hard-rock spodumene (Australia) or brine (Chile/Argentina) extraction.',
  refineLabel: 'Chemical conversion (carbonate/hydroxide)',
  refineDesc:
    'Conversion to battery-grade carbonate/hydroxide — the chokepoint, ~60–65% China (IEA).',
  refineCountry: 'China',
  unit: 'tonne',
});
export const cobaltChain = mineralChain('cobalt', {
  miningDesc: 'Mined ~76% in the DR Congo, largely as a copper/nickel by-product.',
  refineLabel: 'Refining (battery-grade)',
  refineDesc: 'Refined to battery-grade sulfate/metal — ~75%+ China (IEA).',
  refineCountry: 'China',
  unit: 'tonne',
});
export const graphiteChain = mineralChain('graphite', {
  miningDesc: 'Flake graphite mined ~78% in China; Madagascar/Mozambique balance.',
  refineLabel: 'Spherical/anode processing',
  refineDesc: 'Purification to coated spherical anode graphite — >90% China (IEA).',
  refineCountry: 'China',
  unit: 'tonne',
});
export const manganeseChain = mineralChain('manganese', {
  miningDesc: 'Ore mined ~37% South Africa, ~23% Gabon (Mn content).',
  refineLabel: 'Ferroalloy / HPMSM processing',
  refineDesc:
    'Ferro/silicomanganese for steel (spread) or battery-grade HPMSM (~90% China).',
  refineCountry: 'China (battery-grade)',
  unit: 'tonne',
});
export const titaniumChain = mineralChain('titanium', {
  miningDesc: 'Ilmenite/rutile heavy-mineral-sand mining (China, Mozambique, South Africa).',
  refineLabel: 'Sponge metal (Kroll) / TiO₂ pigment',
  refineDesc: 'Titanium sponge ~69% China; aerospace-grade also Japan/Russia (VSMPO).',
  refineCountry: 'China',
  unit: 'tonne',
});
export const tungstenChain = mineralChain('tungsten', {
  miningDesc: 'Ore/concentrate mined ~83% in China.',
  refineLabel: 'APT / carbide conversion',
  refineDesc: 'Ammonium paratungstate and tungsten carbide processing — China-dominated.',
  refineCountry: 'China',
  unit: 'tonne',
});
// Uranium models the FUEL CYCLE, not mining, as its chokepoint (Recommendation
// 5). Ore is diversified and abundant; the binding constraints are conversion
// and — decisively — ENRICHMENT, including HALEU (5–20% U-235) for advanced
// reactors, where Centrus is the only Western producer at demonstration scale.
export const uraniumChain: SupplyChainStep[] = [
  {
    id: 'uranium_mining',
    order: 1,
    key: 'extraction',
    label: 'Mining (U₃O₈ yellowcake)',
    description: 'U₃O₈ mined ~39% Kazakhstan, ~24% Canada (ISL & conventional) — diversified, not the chokepoint.',
    specifics: {},
    costParamKeys: ['uranium.mining'],
  },
  {
    id: 'uranium_conversion',
    order: 2,
    key: 'processing',
    label: 'Conversion (UF₆)',
    description: 'Yellowcake → uranium hexafluoride (UF₆) feed for enrichment; thin Western capacity.',
    specifics: { dominantSupplier: 'Russia / China-heavy' },
    costParamKeys: ['uranium.conversion'],
  },
  {
    id: 'uranium_enrichment',
    order: 3,
    key: 'separation',
    label: 'Enrichment (SWU)',
    description: 'Centrifuge enrichment to reactor-grade — the binding chokepoint; Russia/Rosatom ~44% of world SWU.',
    specifics: { dominantSupplier: 'Russia ~44% of SWU' },
    costParamKeys: ['uranium.enrichment'],
  },
  {
    id: 'uranium_haleu',
    order: 4,
    key: 'refining',
    label: 'HALEU enrichment (5–20% U-235)',
    description: 'High-assay low-enriched fuel for SMRs/advanced reactors — Centrus is the only Western producer, at demo scale. A textbook single-point-of-failure.',
    specifics: { dominantSupplier: 'Russia/China at scale; 1 Western (Centrus)' },
    costParamKeys: ['uranium.haleu'],
  },
  {
    id: 'uranium_logistics',
    order: 5,
    key: 'storage',
    label: 'Fuel fabrication & logistics',
    description: 'Fabrication (incl. TRISO) and secured transport of enriched fuel; thin ex-Russia capacity.',
    specifics: {},
    costParamKeys: ['uranium.freight'],
  },
];
