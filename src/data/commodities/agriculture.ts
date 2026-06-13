import type { Commodity, CommodityCategory, SupplyChainStep } from '@/types';

// Food inputs. Grains & livestock have free CME/CBOT futures on Yahoo (wired in
// the price mapper); eggs and fertilizer have no keyless feed → price errors out.
// Trade (Comtrade) is wired for all. Native unit is the metric tonne (Comtrade
// values are USD, so the unit only affects price display). Cost-structure chains
// below are MODELED anchors (USDA cost-of-production / industry), badged MODELED.
function food(
  id: string,
  name: string,
  benchmark: string,
  priceSymbol: string,
  chainTemplateId: string,
  category: CommodityCategory = 'agriculture',
): Commodity {
  return { id, name, category, nativeUnit: 'tonne', benchmark, priceSymbol, chainTemplateId };
}

export const wheat = food('wheat', 'Wheat', 'CBOT Wheat', 'ZW=F', 'chain_grain');
export const corn = food('corn', 'Corn', 'CBOT Corn', 'ZC=F', 'chain_grain');
export const soybeans = food('soybeans', 'Soybeans', 'CBOT Soybeans', 'ZS=F', 'chain_grain');
export const beef = food('beef', 'Beef (Live Cattle)', 'CME Live Cattle', 'LE=F', 'chain_livestock');
export const pork = food('pork', 'Pork (Lean Hogs)', 'CME Lean Hogs', 'HE=F', 'chain_livestock');
export const eggs = food('eggs', 'Eggs', 'USDA shell eggs', '', 'chain_eggs');
export const fertilizer = food('fertilizer', 'Fertilizer (Urea)', 'Granular urea', '', 'chain_urea', 'fertilizer');

function step(
  id: string,
  order: number,
  key: string,
  label: string,
  description: string,
  paramKey: string,
): SupplyChainStep {
  return { id, order, key, label, description, specifics: {}, costParamKeys: [paramKey] };
}

// Field crops: inputs → cultivation → drying/storage → inland haul → ocean freight.
function grainChain(id: string): SupplyChainStep[] {
  return [
    step(`${id}_seed`, 1, 'inputs', 'Seed & inputs', 'Certified seed and stand establishment.', `${id}.seed`),
    step(`${id}_fert`, 2, 'inputs', 'Fertilizer & crop protection', 'NPK fertilizer, herbicides, fungicides.', `${id}.fertilizer_chem`),
    step(`${id}_field`, 3, 'cultivation', 'Field operations', 'Machinery, fuel, labor — planting through harvest.', `${id}.field_ops`),
    step(`${id}_land`, 4, 'overhead', 'Land & overhead', 'Land rent, insurance, general farm overhead.', `${id}.land_overhead`),
    step(`${id}_store`, 5, 'storage', 'Drying & elevator storage', 'Grain drying and country-elevator storage.', `${id}.drying_storage`),
    step(`${id}_inland`, 6, 'inland_transport', 'Inland transport', 'Rail / barge to the export elevator.', `${id}.inland_freight`),
    step(`${id}_ocean`, 7, 'ocean_freight', 'Ocean freight', 'Bulk carrier to the import market.', `${id}.ocean_freight`),
  ];
}

// Livestock/meat: feeder animal → feed → husbandry → processing → cold chain.
function livestockChain(id: string): SupplyChainStep[] {
  return [
    step(`${id}_feeder`, 1, 'inputs', 'Feeder animal', 'Cost of the weaned/feeder animal entering the lot.', `${id}.feeder`),
    step(`${id}_feed`, 2, 'inputs', 'Feed', 'Grain & forage ration — the largest cost driver.', `${id}.feed`),
    step(`${id}_husbandry`, 3, 'cultivation', 'Labor, vet & yardage', 'Labor, animal health, housing and yardage.', `${id}.labor_vet`),
    step(`${id}_process`, 4, 'processing', 'Processing & packing', 'Slaughter, fabrication, primal/retail packing.', `${id}.processing`),
    step(`${id}_cold`, 5, 'ocean_freight', 'Cold-chain logistics', 'Refrigerated/frozen freight to the import market.', `${id}.cold_freight`),
  ];
}

const eggsChain: SupplyChainStep[] = [
  step('eggs_pullet', 1, 'inputs', 'Pullet', 'Cost of the laying hen (raised pullet).', 'eggs.pullet'),
  step('eggs_feed', 2, 'inputs', 'Feed', 'Layer ration — the largest cost driver.', 'eggs.feed'),
  step('eggs_labor', 3, 'cultivation', 'Labor & farm overhead', 'Labor, housing, flock health.', 'eggs.labor'),
  step('eggs_grade', 4, 'processing', 'Grading & packing', 'Washing, candling, grading, cartoning.', 'eggs.grading'),
  step('eggs_cold', 5, 'ocean_freight', 'Cold-chain logistics', 'Refrigerated freight to market.', 'eggs.cold_freight'),
];

const ureaChain: SupplyChainStep[] = [
  step('fertilizer_gas', 1, 'inputs', 'Natural-gas feedstock', 'Gas feedstock — ~70–80% of nitrogen-fertilizer cost.', 'fertilizer.gas_feedstock'),
  step('fertilizer_ammonia', 2, 'processing', 'Ammonia synthesis', 'Haber-Bosch ammonia from gas + air.', 'fertilizer.ammonia_synthesis'),
  step('fertilizer_urea', 3, 'processing', 'Urea granulation', 'Ammonia + CO₂ → urea melt → granulation/prilling.', 'fertilizer.granulation'),
  step('fertilizer_bag', 4, 'fabrication', 'Bagging & handling', 'Bulk handling or bagging at plant.', 'fertilizer.bagging'),
  step('fertilizer_freight', 5, 'ocean_freight', 'Ocean freight', 'Bulk carrier to the import market.', 'fertilizer.freight'),
];

export const wheatChain = grainChain('wheat');
export const cornChain = grainChain('corn');
export const soybeansChain = grainChain('soybeans');
export const beefChain = livestockChain('beef');
export const porkChain = livestockChain('pork');
export { eggsChain, ureaChain };
