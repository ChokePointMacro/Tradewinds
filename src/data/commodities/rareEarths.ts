import type { Commodity, SupplyChainStep } from '@/types';

// Rare earths. No free price feed (NdPr/Dy oxide are priced by Argus/Fastmarkets,
// paid) → price errors out under the source-or-error rule. Trade (Comtrade) and
// production (USGS) are wired. Magnet rare earths are the supply-chain headline;
// solvent-extraction separation is the costly, China-dominated chokepoint step.
export const neodymium: Commodity = {
  id: 'neodymium',
  name: 'Neodymium (NdPr)',
  category: 'rare_earth',
  nativeUnit: 'kg',
  benchmark: 'NdPr oxide',
  priceSymbol: '',
  chainTemplateId: 'chain_ree',
};

export const dysprosium: Commodity = {
  id: 'dysprosium',
  name: 'Dysprosium',
  category: 'rare_earth',
  nativeUnit: 'kg',
  benchmark: 'Dy oxide',
  priceSymbol: '',
  chainTemplateId: 'chain_ree',
};

function reeChain(id: string): SupplyChainStep[] {
  return [
    {
      id: `${id}_mining`,
      order: 1,
      key: 'extraction',
      label: 'Mining',
      description: 'Extraction of RE-bearing ore (bastnäsite / monazite / ionic-clay).',
      specifics: {},
      costParamKeys: [`${id}.mining`],
    },
    {
      id: `${id}_benef`,
      order: 2,
      key: 'processing',
      label: 'Beneficiation',
      description: 'Crush, grind, flotation → mixed rare-earth concentrate.',
      specifics: {},
      costParamKeys: [`${id}.beneficiation`],
    },
    {
      id: `${id}_separation`,
      order: 3,
      key: 'separation',
      label: 'Separation (solvent extraction)',
      description: 'Solvent-extraction separation into individual oxides — the costly step, ~90% China-controlled.',
      specifics: { dominantSupplier: 'China' },
      costParamKeys: [`${id}.separation`],
    },
    {
      id: `${id}_metal`,
      order: 4,
      key: 'refining',
      label: 'Oxide → metal / alloy',
      description: 'Reduction of oxide to metal and NdFeB magnet alloy (where applicable).',
      specifics: {},
      costParamKeys: [`${id}.reduction`],
    },
    {
      id: `${id}_logistics`,
      order: 5,
      key: 'storage',
      label: 'Logistics',
      description: 'Secured freight & storage of separated oxide / metal.',
      specifics: {},
      costParamKeys: [`${id}.freight_pct`],
    },
  ];
}

export const neodymiumChain = reeChain('neodymium');
export const dysprosiumChain = reeChain('dysprosium');
