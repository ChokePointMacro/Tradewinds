import type { Commodity, SupplyChainStep } from '@/types';

export const oil: Commodity = {
  id: 'crude_oil',
  name: 'Crude Oil',
  category: 'energy',
  nativeUnit: 'bbl',
  benchmark: 'WTI / Brent',
  priceSymbol: 'WTIOIL-FUT',
  chainTemplateId: 'chain_oil',
};

// Tailored chain (PRD 10.1): no "assembly" step — midstream/refining instead.
export const oilChain: SupplyChainStep[] = [
  {
    id: 'oil_explore',
    order: 1,
    key: 'prospecting',
    label: 'Exploration / Prospecting',
    description: 'Seismic survey and exploratory drilling; amortized per-bbl over reserve life.',
    specifics: { method: 'Seismic + exploratory wells' },
    costParamKeys: ['oil.exploration_amort'],
  },
  {
    id: 'oil_sitebuild',
    order: 2,
    key: 'sitebuild',
    label: 'Appraisal & Site Build',
    description: 'Leasing, platform/well-pad construction, infrastructure.',
    specifics: {},
    costParamKeys: ['oil.sitebuild_amort'],
  },
  {
    id: 'oil_extraction',
    order: 3,
    key: 'extraction',
    label: 'Extraction (Lifting)',
    description:
      'Production from well. Middle East onshore very low (~$3–10/bbl); US shale higher; offshore higher still.',
    specifics: { note: 'ME onshore low; shale/offshore higher' },
    costParamKeys: ['oil.lifting_cost'],
  },
  {
    id: 'oil_midstream',
    order: 4,
    key: 'midstream',
    label: 'Gathering & Midstream',
    description: 'Pipelines to terminal/port; regional tariff $/bbl.',
    specifics: {},
    costParamKeys: ['oil.midstream_tariff'],
  },
  {
    id: 'oil_marine',
    order: 5,
    key: 'shipping',
    label: 'Marine Transport (Export)',
    description: 'VLCC/Suezmax/Aframax tanker. Freight quoted in Worldscale; bunker fuel a major driver.',
    specifics: { freightBasis: 'Worldscale × flat rate' },
    costParamKeys: ['oil.freight_ws_flat', 'oil.freight_ws_pct', 'oil.bunker_cost', 'oil.vessel_speed_vlcc'],
    configurable: [
      {
        type: 'lane',
        label: 'Vessel class',
        options: ['VLCC', 'Suezmax', 'Aframax'],
        default: 'VLCC',
      },
    ],
  },
  {
    id: 'oil_refining',
    order: 6,
    key: 'refining',
    label: 'Refining',
    description: 'Crude → products (gasoline, diesel, jet). Margin via crack spread $/bbl.',
    specifics: {},
    costParamKeys: ['oil.refining_margin'],
    configurable: [
      {
        type: 'country',
        label: 'Refining location',
        options: ['US Gulf Coast', 'Rotterdam', 'Singapore'],
        default: 'US Gulf Coast',
      },
    ],
  },
  {
    id: 'oil_storage',
    order: 7,
    key: 'storage',
    label: 'Distribution & Storage',
    description: 'Product storage / tank farms (e.g., Cushing OK for WTI), SPR context.',
    specifics: { hubs: 'Cushing, US Gulf Coast' },
    costParamKeys: ['oil.storage_cost'],
    configurable: [
      { type: 'toggle', label: 'Cushing', options: ['on', 'off'], default: 'off' },
      { type: 'toggle', label: 'US Gulf Coast', options: ['on', 'off'], default: 'off' },
    ],
  },
];
