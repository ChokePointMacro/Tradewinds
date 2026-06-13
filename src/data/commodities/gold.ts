import type { Commodity, SupplyChainStep } from '@/types';

export const gold: Commodity = {
  id: 'gold',
  name: 'Gold',
  category: 'precious_metal',
  nativeUnit: 'ozt',
  benchmark: 'LBMA Gold',
  priceSymbol: 'XAU',
  chainTemplateId: 'chain_gold',
};

// Tailored chain (PRD 10.2). Gold frequently moves by secured AIR freight.
export const goldChain: SupplyChainStep[] = [
  {
    id: 'gold_explore',
    order: 1,
    key: 'prospecting',
    label: 'Prospecting / Exploration',
    description: 'Geochemical survey, drilling, resource definition. Amortized $/oz (high-variance).',
    specifics: {},
    costParamKeys: ['gold.exploration_amort'],
  },
  {
    id: 'gold_minebuild',
    order: 2,
    key: 'permitting',
    label: 'Permitting & Mine Build',
    description: 'Feasibility study, permits, construction. Amortized capex $/oz.',
    specifics: {},
    costParamKeys: ['gold.minebuild_amort'],
  },
  {
    id: 'gold_extraction',
    order: 3,
    key: 'extraction',
    label: 'Extraction (Mining)',
    description: 'Open-pit or underground ore extraction.',
    specifics: { method: 'Open-pit / underground' },
    costParamKeys: [],
  },
  {
    id: 'gold_processing',
    order: 4,
    key: 'processing',
    label: 'Processing / Beneficiation',
    description: 'Crushing, grinding, leaching (CIL/CIP) → doré. Cost anchor: AISC (All-In Sustaining Cost).',
    specifics: { product: 'Doré', costMetric: 'AISC' },
    costParamKeys: ['gold.aisc'],
  },
  {
    id: 'gold_refining',
    order: 5,
    key: 'refining',
    label: 'Refining',
    description: 'Doré → 99.99% (four-nines) bullion at an LBMA Good Delivery accredited refinery.',
    specifics: { accreditation: 'LBMA Good Delivery' },
    costParamKeys: ['gold.refining_charge'],
    configurable: [
      {
        type: 'country',
        label: 'Refining country',
        options: ['Switzerland', 'USA', 'South Africa'],
        default: 'Switzerland',
      },
    ],
  },
  {
    id: 'gold_fabrication',
    order: 6,
    key: 'fabrication',
    label: 'Fabrication / Minting',
    description: 'Bars, coins (optional finished-goods context per A5).',
    specifics: { optional: 'finished goods' },
    costParamKeys: ['gold.fabrication_premium'],
  },
  {
    id: 'gold_logistics',
    order: 7,
    key: 'storage',
    label: 'Secure Logistics & Storage',
    description: 'High-value secured freight (Brink’s/Loomis-type), vault storage (London/Zurich/NY).',
    specifics: { transport: 'Secured air freight' },
    costParamKeys: ['gold.secured_freight_pct', 'gold.insurance_pct', 'gold.vault_storage'],
    configurable: [
      { type: 'location', label: 'Vault', options: ['London', 'Zurich', 'New York'], default: 'London' },
    ],
  },
];
