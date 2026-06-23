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

// Rare-earth compounds/oxides (aggregate, HS 2846). Separation (solvent
// extraction) is the ~90% China chokepoint — same reeChain shape.
export const reCompounds: Commodity = {
  id: 're_compounds',
  name: 'Rare-earth compounds',
  category: 'rare_earth',
  nativeUnit: 'tonne',
  benchmark: 'RE oxide (Argus)',
  priceSymbol: '',
  chainTemplateId: 'chain_ree',
};
export const reCompoundsChain = reeChain('re_compounds');

// NdFeB sintered permanent magnets (HS 8505.11) — the downstream chokepoint of
// the rare-earth chain. Magnet-making (sintering) is ~90–94% China (IEA 2024);
// the US/EU are ~75–98% import-dependent. Priced off NdPr-oxide content plus a
// conversion margin (Argus/Fastmarkets, paid) → source-or-error.
export const ndfebMagnets: Commodity = {
  id: 'ndfeb_magnets',
  name: 'NdFeB magnets',
  category: 'rare_earth',
  nativeUnit: 'tonne',
  benchmark: 'NdFeB magnet, NdPr-linked (Argus/Fastmarkets)',
  priceSymbol: '',
  chainTemplateId: 'chain_magnet',
};

export const ndfebMagnetsChain: SupplyChainStep[] = [
  {
    id: 'ndfeb_magnets_oxide',
    order: 1,
    key: 'extraction',
    label: 'Magnet rare-earth oxides',
    description: 'NdPr oxide (+ Dy/Tb for high-temp grades) from separated rare earths.',
    specifics: { dominantSupplier: 'China' },
    costParamKeys: ['ndfeb_magnets.oxide'],
  },
  {
    id: 'ndfeb_magnets_alloy',
    order: 2,
    key: 'refining',
    label: 'Metal & strip-cast alloy',
    description: 'Reduction of oxide to RE metal and NdFeB strip-cast alloy — China-dominated.',
    specifics: { dominantSupplier: 'China' },
    costParamKeys: ['ndfeb_magnets.alloy'],
  },
  {
    id: 'ndfeb_magnets_sinter',
    order: 3,
    key: 'processing',
    label: 'Sintering & magnet-making',
    description: 'Mill, press, sinter, machine, coat → finished magnet — ~90–94% China (IEA), the chokepoint.',
    specifics: { dominantSupplier: 'China (~90–94%)' },
    costParamKeys: ['ndfeb_magnets.sintering'],
  },
  {
    id: 'ndfeb_magnets_logistics',
    order: 4,
    key: 'storage',
    label: 'Logistics',
    description: 'Freight and bonded storage of finished magnets.',
    specifics: {},
    costParamKeys: ['ndfeb_magnets.freight'],
  },
];
