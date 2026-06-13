import type { Commodity, CommodityCategory } from '@/types';

// Food inputs. Grains & livestock have free CME/CBOT futures on Yahoo (wired in
// the price mapper); eggs and fertilizer have no keyless feed → price errors out.
// Trade (Comtrade) is wired for all. Native unit is the metric tonne (Comtrade
// values are USD, so the unit only affects price display).
function food(
  id: string,
  name: string,
  benchmark: string,
  priceSymbol: string,
  category: CommodityCategory = 'agriculture',
): Commodity {
  return { id, name, category, nativeUnit: 'tonne', benchmark, priceSymbol, chainTemplateId: 'chain_none' };
}

export const wheat = food('wheat', 'Wheat', 'CBOT Wheat', 'ZW=F');
export const corn = food('corn', 'Corn', 'CBOT Corn', 'ZC=F');
export const soybeans = food('soybeans', 'Soybeans', 'CBOT Soybeans', 'ZS=F');
export const beef = food('beef', 'Beef (Live Cattle)', 'CME Live Cattle', 'LE=F');
export const pork = food('pork', 'Pork (Lean Hogs)', 'CME Lean Hogs', 'HE=F');
export const eggs = food('eggs', 'Eggs', 'USDA shell eggs', '');
export const fertilizer = food('fertilizer', 'Fertilizer (Urea)', 'Granular urea', '', 'fertilizer');
