import type { Commodity } from '@/types';

// Rare earths. No free price feed (NdPr/Dy oxide are priced by Argus/Fastmarkets,
// paid) → price errors out under the source-or-error rule. Trade (Comtrade) and
// production (USGS) are wired. Magnet rare earths are the supply-chain headline.
export const neodymium: Commodity = {
  id: 'neodymium',
  name: 'Neodymium (NdPr)',
  category: 'rare_earth',
  nativeUnit: 'kg',
  benchmark: 'NdPr oxide',
  priceSymbol: '',
  chainTemplateId: 'chain_none',
};

export const dysprosium: Commodity = {
  id: 'dysprosium',
  name: 'Dysprosium',
  category: 'rare_earth',
  nativeUnit: 'kg',
  benchmark: 'Dy oxide',
  priceSymbol: '',
  chainTemplateId: 'chain_none',
};
