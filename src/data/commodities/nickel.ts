import type { Commodity, SupplyChainStep } from '@/types';

export const nickel: Commodity = {
  id: 'nickel',
  name: 'Nickel',
  category: 'base_metal',
  nativeUnit: 'tonne',
  benchmark: 'LME Nickel',
  priceSymbol: 'LME-NI',
  chainTemplateId: 'chain_base_metal',
};

// Base-metal chain. Nickel splits between sulphide (→ refined Class 1) and
// laterite/HPAL (→ MHP/NPI for stainless & batteries). Cost anchor C1 $/tonne.
export const nickelChain: SupplyChainStep[] = [
  {
    id: 'nickel_explore',
    order: 1,
    key: 'prospecting',
    label: 'Exploration / Prospecting',
    description: 'Drilling to define sulphide or laterite resources. Amortized $/t.',
    specifics: {},
    costParamKeys: ['nickel.exploration_amort'],
  },
  {
    id: 'nickel_minebuild',
    order: 2,
    key: 'permitting',
    label: 'Permitting & Mine Build',
    description: 'Feasibility, permits, mine/HPAL plant construction. Amortized capex $/t.',
    specifics: {},
    costParamKeys: ['nickel.minebuild_amort'],
  },
  {
    id: 'nickel_extraction',
    order: 3,
    key: 'extraction',
    label: 'Mining & Beneficiation',
    description: 'Sulphide flotation or laterite leaching (HPAL) → intermediate. Anchor: C1 cash cost.',
    specifics: { product: 'Concentrate / MHP', costMetric: 'C1 cash cost' },
    costParamKeys: ['nickel.c1_cash_cost'],
  },
  {
    id: 'nickel_refine',
    order: 4,
    key: 'refining',
    label: 'Smelting & Refining',
    description: 'Intermediate → Class 1 (briquette/cathode) or NPI/sulphate. Refining charges $/t.',
    specifics: { product: 'Class 1 / NPI', costMetric: 'Refining charge' },
    costParamKeys: ['nickel.refining_charge'],
    configurable: [
      { type: 'country', label: 'Refiner location', options: ['Indonesia', 'China', 'Canada'], default: 'Indonesia' },
    ],
  },
  {
    id: 'nickel_freight',
    order: 5,
    key: 'shipping',
    label: 'Ocean Freight (Dry Bulk)',
    description: 'Refined nickel / intermediates by bulk carrier. $/tonne, distance-scaled.',
    specifics: { freightBasis: 'Dry bulk $/tonne' },
    costParamKeys: ['nickel.bulk_freight'],
    configurable: [
      { type: 'lane', label: 'Vessel class', options: ['Handysize', 'Supramax', 'Panamax'], default: 'Supramax' },
    ],
  },
  {
    id: 'nickel_storage',
    order: 6,
    key: 'storage',
    label: 'Warehousing & Delivery',
    description: 'LME-registered warehouse storage and rent; delivery to stainless/battery maker.',
    specifics: { hubs: 'LME warehouses' },
    costParamKeys: ['nickel.warehousing'],
  },
];
