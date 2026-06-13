import type { Commodity, SupplyChainStep } from '@/types';

export const palladium: Commodity = {
  id: 'palladium',
  name: 'Palladium',
  category: 'precious_metal',
  nativeUnit: 'ozt',
  benchmark: 'LPPM Palladium',
  priceSymbol: 'PA=F',
  chainTemplateId: 'chain_pgm',
};

// PGM chain: mostly a by-product of nickel/platinum mining (Norilsk, Bushveld).
// Moves by secured air freight like other precious metals. Value-based freight.
export const palladiumChain: SupplyChainStep[] = [
  {
    id: 'pd_explore',
    order: 1,
    key: 'prospecting',
    label: 'Exploration / Prospecting',
    description: 'Drilling of PGM-bearing reef (Merensky/UG2) or nickel-sulphide bodies. Amortized $/oz.',
    specifics: {},
    costParamKeys: ['palladium.exploration_amort'],
  },
  {
    id: 'pd_minebuild',
    order: 2,
    key: 'permitting',
    label: 'Permitting & Mine Build',
    description: 'Feasibility, permits, deep-shaft construction. Amortized capex $/oz.',
    specifics: {},
    costParamKeys: ['palladium.minebuild_amort'],
  },
  {
    id: 'pd_extraction',
    order: 3,
    key: 'extraction',
    label: 'Extraction (Mining)',
    description: 'Underground reef mining or recovered as nickel/platinum by-product. Anchor: AISC.',
    specifics: { method: 'Deep-shaft / by-product', costMetric: 'AISC' },
    costParamKeys: ['palladium.aisc'],
  },
  {
    id: 'pd_refine',
    order: 4,
    key: 'refining',
    label: 'Smelting & PGM Refining',
    description: 'Smelting, base-metal removal, precious-metal refinery → 99.95% sponge/ingot.',
    specifics: { product: 'Sponge / ingot (99.95%)' },
    costParamKeys: ['palladium.refining_charge'],
    configurable: [
      { type: 'country', label: 'Refining country', options: ['South Africa', 'Russia', 'USA'], default: 'South Africa' },
    ],
  },
  {
    id: 'pd_logistics',
    order: 5,
    key: 'storage',
    label: 'Secure Logistics & Storage',
    description: 'High-value secured air freight + transit insurance; vault storage (Zurich/London).',
    specifics: { transport: 'Secured air freight' },
    costParamKeys: ['palladium.secured_freight_pct', 'palladium.insurance_pct', 'palladium.vault_storage'],
    configurable: [
      { type: 'location', label: 'Vault', options: ['Zurich', 'London', 'New York'], default: 'Zurich' },
    ],
  },
];
