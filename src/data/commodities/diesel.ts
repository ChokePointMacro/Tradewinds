import type { Commodity, SupplyChainStep } from '@/types';

export const diesel: Commodity = {
  id: 'diesel',
  name: 'Diesel',
  category: 'energy',
  nativeUnit: 'bbl',
  benchmark: 'ULSD (NY Harbor)',
  priceSymbol: 'HO=F',
  chainTemplateId: 'chain_refined_product',
};

// Refined-product chain: a downstream cut of crude, so it starts at the refinery
// rather than a wellhead. Moved by product tanker (MR/LR). Worldscale-style $/bbl.
export const dieselChain: SupplyChainStep[] = [
  {
    id: 'diesel_feedstock',
    order: 1,
    key: 'feedstock',
    label: 'Crude Feedstock',
    description: 'Crude oil delivered to the refinery — the dominant input cost for the product.',
    specifics: { input: 'Crude oil' },
    costParamKeys: ['diesel.feedstock_cost'],
  },
  {
    id: 'diesel_refining',
    order: 2,
    key: 'refining',
    label: 'Refining (Distillation + Hydrotreating)',
    description: 'Atmospheric distillation → middle distillate, then hydrotreating to <10 ppm sulphur (ULSD).',
    specifics: { spec: 'ULSD <10 ppm S', costMetric: 'Crack spread' },
    costParamKeys: ['diesel.refining_margin'],
    configurable: [
      { type: 'country', label: 'Refining location', options: ['US Gulf Coast', 'Rotterdam', 'Singapore'], default: 'US Gulf Coast' },
    ],
  },
  {
    id: 'diesel_blend',
    order: 3,
    key: 'blending',
    label: 'Blending & Additives',
    description: 'Cold-flow additives, cetane improvers, and biodiesel blending (Bx mandates).',
    specifics: {},
    costParamKeys: ['diesel.blending_cost'],
  },
  {
    id: 'diesel_marine',
    order: 4,
    key: 'shipping',
    label: 'Marine Transport (Product Tanker)',
    description: 'MR/LR clean-product tanker. Freight quoted in Worldscale; bunker a major driver. $/bbl.',
    specifics: { freightBasis: 'Worldscale × flat rate' },
    costParamKeys: ['diesel.freight_ws_flat', 'diesel.freight_ws_pct', 'diesel.bunker_cost'],
    configurable: [
      { type: 'lane', label: 'Vessel class', options: ['MR', 'LR1', 'LR2'], default: 'MR' },
    ],
  },
  {
    id: 'diesel_storage',
    order: 5,
    key: 'storage',
    label: 'Distribution & Storage',
    description: 'Terminal tankage, pipeline/rack distribution to wholesale and retail.',
    specifics: { hubs: 'NY Harbor, ARA, Singapore' },
    costParamKeys: ['diesel.storage_cost'],
  },
];
