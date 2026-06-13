import type { Commodity, SupplyChainStep } from '@/types';

export const silver: Commodity = {
  id: 'silver',
  name: 'Silver',
  category: 'precious_metal',
  nativeUnit: 'ozt',
  benchmark: 'LBMA Silver',
  priceSymbol: 'XAG',
  chainTemplateId: 'chain_silver',
};

// Tailored chain (PRD 10.3). Key nuance: most silver is a BY-PRODUCT of
// lead/zinc/copper/gold mining, which changes cost attribution.
export const silverChain: SupplyChainStep[] = [
  {
    id: 'silver_explore',
    order: 1,
    key: 'prospecting',
    label: 'Prospecting / Exploration',
    description: 'Often part of base-metal exploration.',
    specifics: {},
    costParamKeys: ['silver.exploration_amort'],
  },
  {
    id: 'silver_minebuild',
    order: 2,
    key: 'permitting',
    label: 'Permitting & Mine Build',
    description: 'Feasibility, permits, construction.',
    specifics: {},
    costParamKeys: ['silver.minebuild_amort'],
  },
  {
    id: 'silver_extraction',
    order: 3,
    key: 'extraction',
    label: 'Extraction',
    description: 'Primary silver mines + by-product streams.',
    specifics: { source: 'Primary + by-product' },
    costParamKeys: [],
  },
  {
    id: 'silver_processing',
    order: 4,
    key: 'processing',
    label: 'Processing / Beneficiation',
    description:
      'Flotation/leaching. By-product credit accounting matters — primary AISC overstates marginal by-product cost.',
    specifics: { costMetric: 'AISC (primary) vs by-product credit' },
    costParamKeys: ['silver.aisc_primary', 'silver.byproduct_credit'],
    configurable: [
      { type: 'toggle', label: 'By-product accounting', options: ['primary', 'byproduct'], default: 'primary' },
    ],
  },
  {
    id: 'silver_refining',
    order: 5,
    key: 'refining',
    label: 'Refining',
    description: 'To 99.9% (three-nines) / 99.99%.',
    specifics: {},
    costParamKeys: ['silver.refining_charge'],
    configurable: [
      { type: 'country', label: 'Refining country', options: ['USA', 'Germany', 'Peru'], default: 'USA' },
    ],
  },
  {
    id: 'silver_fabrication',
    order: 6,
    key: 'fabrication',
    label: 'Fabrication',
    description: 'Bars, coins, industrial grain (large industrial demand — solar PV, electronics).',
    specifics: { demand: 'Industrial: solar PV, electronics' },
    costParamKeys: ['silver.fabrication_premium'],
  },
  {
    id: 'silver_logistics',
    order: 7,
    key: 'storage',
    label: 'Logistics & Storage',
    description: 'Secured freight (lower value density than gold; sea or air viable), vault storage.',
    specifics: { transport: 'Sea or air' },
    costParamKeys: ['silver.freight_pct', 'silver.vault_storage'],
  },
];
