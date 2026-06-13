import type { CostParameter } from '@/types';

// Seed defaults (PRD 13.1). All MODELED placeholders, user-editable, with a
// source note pointing to where to verify. These are cost-STRUCTURE anchors,
// distinct from live market prices (Tab 3).
export const COST_PARAMETERS: CostParameter[] = [
  // Crude Oil (USD/bbl unless noted)
  { key: 'oil.exploration_amort', commodityId: 'crude_oil', label: 'Exploration (amortized)', value: 3, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'Rystad/EIA, company 10-Ks', min: 0, max: 30 },
  { key: 'oil.sitebuild_amort', commodityId: 'crude_oil', label: 'Appraisal & site build (amortized)', value: 5, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'company filings', min: 0, max: 40 },
  { key: 'oil.lifting_cost', commodityId: 'crude_oil', label: 'Lifting/operating cost', value: 8, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'EIA, 10-Ks (ME low, shale higher)', min: 0, max: 60 },
  { key: 'oil.midstream_tariff', commodityId: 'crude_oil', label: 'Pipeline/gathering tariff', value: 2, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'FERC/regional tariffs', min: 0, max: 15 },
  { key: 'oil.freight_ws_flat', commodityId: 'crude_oil', label: 'Worldscale flat rate', value: 20, unit: 'USD/bbl-equiv', provenance: 'MODELED', sourceNote: 'Worldscale, Baltic tanker', min: 0, max: 80 },
  { key: 'oil.freight_ws_pct', commodityId: 'crude_oil', label: 'Worldscale % of flat', value: 100, unit: '%', provenance: 'MODELED', sourceNote: 'Baltic Exchange', min: 10, max: 400 },
  { key: 'oil.bunker_cost', commodityId: 'crude_oil', label: 'Bunker fuel component', value: 4, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'Ship & Bunker', min: 0, max: 30 },
  { key: 'oil.refining_margin', commodityId: 'crude_oil', label: 'Refining margin/crack', value: 12, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'EIA crack spreads', min: 0, max: 50 },
  { key: 'oil.storage_cost', commodityId: 'crude_oil', label: 'Storage', value: 0.5, unit: 'USD/bbl/mo', provenance: 'MODELED', sourceNote: 'EIA/commercial tank rates', min: 0, max: 5 },
  { key: 'oil.vessel_speed_vlcc', commodityId: 'crude_oil', label: 'VLCC speed', value: 13, unit: 'knots', provenance: 'MODELED', sourceNote: 'industry typical', min: 8, max: 20 },

  // Gold (USD/ozt unless noted)
  { key: 'gold.exploration_amort', commodityId: 'gold', label: 'Exploration (amortized)', value: 60, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'S&P Global, WGC', min: 0, max: 300 },
  { key: 'gold.minebuild_amort', commodityId: 'gold', label: 'Permitting & mine build (amortized)', value: 150, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'company NI 43-101', min: 0, max: 600 },
  { key: 'gold.aisc', commodityId: 'gold', label: 'All-In Sustaining Cost', value: 1350, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'World Gold Council, Metals Focus', min: 600, max: 2500 },
  { key: 'gold.refining_charge', commodityId: 'gold', label: 'Refining/treatment charge', value: 5, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'refinery schedules', min: 0, max: 50 },
  { key: 'gold.fabrication_premium', commodityId: 'gold', label: 'Fabrication/mint premium', value: 35, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'mint/dealer premiums', min: 0, max: 200 },
  { key: 'gold.secured_freight_pct', commodityId: 'gold', label: 'Secured air freight (% value)', value: 0.3, unit: '% of value', provenance: 'MODELED', sourceNote: 'Brink’s/Loomis quotes', min: 0, max: 3 },
  { key: 'gold.insurance_pct', commodityId: 'gold', label: 'Transit insurance (% value)', value: 0.1, unit: '% of value', provenance: 'MODELED', sourceNote: 'marine/air cargo insurers', min: 0, max: 2 },
  { key: 'gold.vault_storage', commodityId: 'gold', label: 'Vault storage', value: 12, unit: 'USD/ozt/yr', provenance: 'MODELED', sourceNote: 'LBMA vault providers', min: 0, max: 100 },

  // Silver (USD/ozt unless noted)
  { key: 'silver.exploration_amort', commodityId: 'silver', label: 'Exploration (amortized)', value: 1.0, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'S&P Global', min: 0, max: 10 },
  { key: 'silver.minebuild_amort', commodityId: 'silver', label: 'Mine build (amortized)', value: 2.0, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'company filings', min: 0, max: 15 },
  { key: 'silver.aisc_primary', commodityId: 'silver', label: 'Primary-mine AISC', value: 16, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'Silver Institute / Metals Focus', min: 5, max: 40 },
  { key: 'silver.byproduct_credit', commodityId: 'silver', label: 'By-product credit', value: 8, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'World Silver Survey', min: 0, max: 30 },
  { key: 'silver.refining_charge', commodityId: 'silver', label: 'Refining charge', value: 0.3, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'refinery schedules', min: 0, max: 5 },
  { key: 'silver.fabrication_premium', commodityId: 'silver', label: 'Fabrication premium', value: 2.0, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'dealer premiums', min: 0, max: 20 },
  { key: 'silver.freight_pct', commodityId: 'silver', label: 'Secured freight (% value)', value: 0.4, unit: '% of value', provenance: 'MODELED', sourceNote: 'logistics quotes', min: 0, max: 3 },
  { key: 'silver.vault_storage', commodityId: 'silver', label: 'Vault storage', value: 0.5, unit: 'USD/ozt/yr', provenance: 'MODELED', sourceNote: 'vault providers', min: 0, max: 5 },

  // Copper (USD/tonne unless noted)
  { key: 'copper.exploration_amort', commodityId: 'copper', label: 'Exploration (amortized)', value: 150, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'S&P Global, company NI 43-101', min: 0, max: 800 },
  { key: 'copper.minebuild_amort', commodityId: 'copper', label: 'Permitting & mine build (amortized)', value: 600, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'company feasibility studies', min: 0, max: 3000 },
  { key: 'copper.c1_cash_cost', commodityId: 'copper', label: 'C1 cash cost', value: 4500, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Wood Mackenzie, CRU', min: 1000, max: 9000 },
  { key: 'copper.tc_rc', commodityId: 'copper', label: 'Treatment/refining charge (TC/RC)', value: 350, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'smelter benchmark (CSPT)', min: 0, max: 1500 },
  { key: 'copper.bulk_freight', commodityId: 'copper', label: 'Ocean freight (dry bulk)', value: 40, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Baltic Dry, lane quotes', min: 0, max: 200 },
  { key: 'copper.warehousing', commodityId: 'copper', label: 'LME warehousing/rent', value: 25, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'LME warehouse schedules', min: 0, max: 150 },

  // Nickel (USD/tonne unless noted)
  { key: 'nickel.exploration_amort', commodityId: 'nickel', label: 'Exploration (amortized)', value: 400, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'S&P Global, company filings', min: 0, max: 2000 },
  { key: 'nickel.minebuild_amort', commodityId: 'nickel', label: 'Permitting & mine/HPAL build (amortized)', value: 1500, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'company feasibility studies', min: 0, max: 8000 },
  { key: 'nickel.c1_cash_cost', commodityId: 'nickel', label: 'C1 cash cost', value: 12000, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Wood Mackenzie, CRU', min: 4000, max: 22000 },
  { key: 'nickel.refining_charge', commodityId: 'nickel', label: 'Smelting/refining charge', value: 1800, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'refinery schedules', min: 0, max: 6000 },
  { key: 'nickel.bulk_freight', commodityId: 'nickel', label: 'Ocean freight (dry bulk)', value: 60, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Baltic Dry, lane quotes', min: 0, max: 250 },
  { key: 'nickel.warehousing', commodityId: 'nickel', label: 'LME warehousing/rent', value: 30, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'LME warehouse schedules', min: 0, max: 150 },

  // Palladium (USD/ozt unless noted)
  { key: 'palladium.exploration_amort', commodityId: 'palladium', label: 'Exploration (amortized)', value: 30, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'S&P Global, company filings', min: 0, max: 200 },
  { key: 'palladium.minebuild_amort', commodityId: 'palladium', label: 'Permitting & mine build (amortized)', value: 90, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'company NI 43-101', min: 0, max: 500 },
  { key: 'palladium.aisc', commodityId: 'palladium', label: 'All-In Sustaining Cost', value: 1050, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'Metals Focus, company reports', min: 400, max: 2000 },
  { key: 'palladium.refining_charge', commodityId: 'palladium', label: 'Smelting & PGM refining charge', value: 25, unit: 'USD/ozt', provenance: 'MODELED', sourceNote: 'refinery schedules', min: 0, max: 150 },
  { key: 'palladium.secured_freight_pct', commodityId: 'palladium', label: 'Secured air freight (% value)', value: 0.3, unit: '% of value', provenance: 'MODELED', sourceNote: 'Brink’s/Loomis quotes', min: 0, max: 3 },
  { key: 'palladium.insurance_pct', commodityId: 'palladium', label: 'Transit insurance (% value)', value: 0.1, unit: '% of value', provenance: 'MODELED', sourceNote: 'air cargo insurers', min: 0, max: 2 },
  { key: 'palladium.vault_storage', commodityId: 'palladium', label: 'Vault storage', value: 10, unit: 'USD/ozt/yr', provenance: 'MODELED', sourceNote: 'vault providers (Zurich/London)', min: 0, max: 100 },

  // Diesel (USD/bbl unless noted)
  { key: 'diesel.feedstock_cost', commodityId: 'diesel', label: 'Crude feedstock cost', value: 86, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'EIA, crude benchmarks', min: 20, max: 200 },
  { key: 'diesel.refining_margin', commodityId: 'diesel', label: 'Refining margin / crack spread', value: 22, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'EIA distillate crack spreads', min: 0, max: 80 },
  { key: 'diesel.blending_cost', commodityId: 'diesel', label: 'Blending & additives', value: 3, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'additive/biodiesel mandates', min: 0, max: 20 },
  { key: 'diesel.freight_ws_flat', commodityId: 'diesel', label: 'Worldscale flat rate', value: 25, unit: 'USD/bbl-equiv', provenance: 'MODELED', sourceNote: 'Worldscale, Baltic clean tanker', min: 0, max: 90 },
  { key: 'diesel.freight_ws_pct', commodityId: 'diesel', label: 'Worldscale % of flat', value: 130, unit: '%', provenance: 'MODELED', sourceNote: 'Baltic Exchange (clean)', min: 10, max: 500 },
  { key: 'diesel.bunker_cost', commodityId: 'diesel', label: 'Bunker fuel component', value: 5, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'Ship & Bunker', min: 0, max: 30 },
  { key: 'diesel.storage_cost', commodityId: 'diesel', label: 'Distribution & storage', value: 2, unit: 'USD/bbl', provenance: 'MODELED', sourceNote: 'terminal/rack rates', min: 0, max: 15 },
];

export function paramsForCommodity(commodityId: string): CostParameter[] {
  return COST_PARAMETERS.filter((p) => p.commodityId === commodityId);
}

export function paramMap(commodityId: string): Record<string, CostParameter> {
  return Object.fromEntries(paramsForCommodity(commodityId).map((p) => [p.key, p]));
}
