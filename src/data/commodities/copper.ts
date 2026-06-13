import type { Commodity, SupplyChainStep } from '@/types';

export const copper: Commodity = {
  id: 'copper',
  name: 'Copper',
  category: 'base_metal',
  nativeUnit: 'tonne',
  benchmark: 'LME Copper',
  priceSymbol: 'HG=F',
  chainTemplateId: 'chain_base_metal',
};

// Base-metal chain (PRD 10.x analogue): mine → concentrate → smelt/refine →
// cathode → dry-bulk ocean freight. Cost anchor is C1 cash cost $/tonne.
export const copperChain: SupplyChainStep[] = [
  {
    id: 'copper_explore',
    order: 1,
    key: 'prospecting',
    label: 'Exploration / Prospecting',
    description: 'Geophysical survey and drilling to define a porphyry/sediment resource. Amortized $/t.',
    specifics: {},
    costParamKeys: ['copper.exploration_amort'],
  },
  {
    id: 'copper_minebuild',
    order: 2,
    key: 'permitting',
    label: 'Permitting & Mine Build',
    description: 'Feasibility, permits, open-pit/underground construction. Amortized capex $/t.',
    specifics: {},
    costParamKeys: ['copper.minebuild_amort'],
  },
  {
    id: 'copper_extraction',
    order: 3,
    key: 'extraction',
    label: 'Mining & Concentration',
    description: 'Ore extraction, crushing, flotation to ~25-30% Cu concentrate. Anchor: C1 cash cost.',
    specifics: { product: 'Concentrate', costMetric: 'C1 cash cost' },
    costParamKeys: ['copper.c1_cash_cost'],
  },
  {
    id: 'copper_smelt',
    order: 4,
    key: 'refining',
    label: 'Smelting & Refining',
    description: 'Concentrate → 99.99% cathode. Smelter charges via TC/RC (treatment/refining charges).',
    specifics: { product: 'Cathode', costMetric: 'TC/RC' },
    costParamKeys: ['copper.tc_rc'],
    configurable: [
      { type: 'country', label: 'Smelter location', options: ['Chile', 'China', 'DRC'], default: 'Chile' },
    ],
  },
  {
    id: 'copper_freight',
    order: 5,
    key: 'shipping',
    label: 'Ocean Freight (Dry Bulk)',
    description: 'Cathode/concentrate moved by bulk carrier (Handysize/Supramax). $/tonne, distance-scaled.',
    specifics: { freightBasis: 'Dry bulk $/tonne' },
    costParamKeys: ['copper.bulk_freight'],
    configurable: [
      { type: 'lane', label: 'Vessel class', options: ['Handysize', 'Supramax', 'Panamax'], default: 'Supramax' },
    ],
  },
  {
    id: 'copper_storage',
    order: 6,
    key: 'storage',
    label: 'Warehousing & Delivery',
    description: 'LME-registered warehouse storage and rent; delivery to fabricator.',
    specifics: { hubs: 'LME warehouses' },
    costParamKeys: ['copper.warehousing'],
  },
];
