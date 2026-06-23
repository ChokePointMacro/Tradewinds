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

  // Neodymium / NdPr (USD/kg oxide unless noted)
  { key: 'neodymium.mining', commodityId: 'neodymium', label: 'Mining', value: 6, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'USGS, MP Materials / Lynas reports', min: 0, max: 40 },
  { key: 'neodymium.beneficiation', commodityId: 'neodymium', label: 'Beneficiation', value: 4, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'producer disclosures', min: 0, max: 30 },
  { key: 'neodymium.separation', commodityId: 'neodymium', label: 'Separation (solvent extraction)', value: 18, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'Adamas Intelligence, producer cost build-ups', min: 0, max: 80 },
  { key: 'neodymium.reduction', commodityId: 'neodymium', label: 'Oxide → metal/alloy', value: 6, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'metal/alloy converters', min: 0, max: 40 },
  { key: 'neodymium.freight_pct', commodityId: 'neodymium', label: 'Secured freight (% value)', value: 0.5, unit: '% of value', provenance: 'MODELED', sourceNote: 'logistics quotes', min: 0, max: 3 },

  // Dysprosium (USD/kg oxide unless noted) — heavy RE, costlier separation
  { key: 'dysprosium.mining', commodityId: 'dysprosium', label: 'Mining', value: 12, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'USGS, ionic-clay producers', min: 0, max: 80 },
  { key: 'dysprosium.beneficiation', commodityId: 'dysprosium', label: 'Beneficiation', value: 8, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'producer disclosures', min: 0, max: 60 },
  { key: 'dysprosium.separation', commodityId: 'dysprosium', label: 'Separation (solvent extraction)', value: 55, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'Adamas Intelligence (heavy RE)', min: 0, max: 200 },
  { key: 'dysprosium.reduction', commodityId: 'dysprosium', label: 'Oxide → metal/alloy', value: 15, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'metal/alloy converters', min: 0, max: 100 },
  { key: 'dysprosium.freight_pct', commodityId: 'dysprosium', label: 'Secured freight (% value)', value: 0.5, unit: '% of value', provenance: 'MODELED', sourceNote: 'logistics quotes', min: 0, max: 3 },

  // Wheat (USD/tonne)
  { key: 'wheat.seed', commodityId: 'wheat', label: 'Seed & inputs', value: 18, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS Commodity Costs & Returns', min: 0, max: 120 },
  { key: 'wheat.fertilizer_chem', commodityId: 'wheat', label: 'Fertilizer & crop protection', value: 45, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 200 },
  { key: 'wheat.field_ops', commodityId: 'wheat', label: 'Field operations', value: 48, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS (machinery, fuel, labor)', min: 0, max: 200 },
  { key: 'wheat.land_overhead', commodityId: 'wheat', label: 'Land & overhead', value: 60, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS (rent, overhead)', min: 0, max: 250 },
  { key: 'wheat.drying_storage', commodityId: 'wheat', label: 'Drying & elevator storage', value: 12, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'country-elevator tariffs', min: 0, max: 60 },
  { key: 'wheat.inland_freight', commodityId: 'wheat', label: 'Inland transport', value: 25, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA Grain Transportation Report', min: 0, max: 120 },
  { key: 'wheat.ocean_freight', commodityId: 'wheat', label: 'Ocean freight', value: 35, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Baltic Dry / IGC freight', min: 0, max: 150 },

  // Corn (USD/tonne)
  { key: 'corn.seed', commodityId: 'corn', label: 'Seed & inputs', value: 30, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 150 },
  { key: 'corn.fertilizer_chem', commodityId: 'corn', label: 'Fertilizer & crop protection', value: 52, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 200 },
  { key: 'corn.field_ops', commodityId: 'corn', label: 'Field operations', value: 45, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 200 },
  { key: 'corn.land_overhead', commodityId: 'corn', label: 'Land & overhead', value: 70, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 250 },
  { key: 'corn.drying_storage', commodityId: 'corn', label: 'Drying & elevator storage', value: 12, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'country-elevator tariffs', min: 0, max: 60 },
  { key: 'corn.inland_freight', commodityId: 'corn', label: 'Inland transport', value: 22, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA Grain Transportation Report', min: 0, max: 120 },
  { key: 'corn.ocean_freight', commodityId: 'corn', label: 'Ocean freight', value: 35, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Baltic Dry / IGC freight', min: 0, max: 150 },

  // Soybeans (USD/tonne)
  { key: 'soybeans.seed', commodityId: 'soybeans', label: 'Seed & inputs', value: 38, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 150 },
  { key: 'soybeans.fertilizer_chem', commodityId: 'soybeans', label: 'Fertilizer & crop protection', value: 22, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 150 },
  { key: 'soybeans.field_ops', commodityId: 'soybeans', label: 'Field operations', value: 48, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 200 },
  { key: 'soybeans.land_overhead', commodityId: 'soybeans', label: 'Land & overhead', value: 85, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 300 },
  { key: 'soybeans.drying_storage', commodityId: 'soybeans', label: 'Drying & elevator storage', value: 12, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'country-elevator tariffs', min: 0, max: 60 },
  { key: 'soybeans.inland_freight', commodityId: 'soybeans', label: 'Inland transport', value: 25, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA Grain Transportation Report', min: 0, max: 120 },
  { key: 'soybeans.ocean_freight', commodityId: 'soybeans', label: 'Ocean freight', value: 38, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Baltic Dry / IGC freight', min: 0, max: 150 },

  // Beef / live cattle (USD/tonne liveweight)
  { key: 'beef.feeder', commodityId: 'beef', label: 'Feeder animal', value: 1900, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS cattle costs & returns', min: 0, max: 6000 },
  { key: 'beef.feed', commodityId: 'beef', label: 'Feed', value: 1500, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS (ration)', min: 0, max: 5000 },
  { key: 'beef.labor_vet', commodityId: 'beef', label: 'Labor, vet & yardage', value: 400, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 2000 },
  { key: 'beef.processing', commodityId: 'beef', label: 'Processing & packing', value: 650, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA AMS, packer margins', min: 0, max: 3000 },
  { key: 'beef.cold_freight', commodityId: 'beef', label: 'Cold-chain logistics', value: 300, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'reefer freight quotes', min: 0, max: 1500 },

  // Pork / lean hogs (USD/tonne)
  { key: 'pork.feeder', commodityId: 'pork', label: 'Feeder animal', value: 400, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS hog costs & returns', min: 0, max: 2000 },
  { key: 'pork.feed', commodityId: 'pork', label: 'Feed', value: 900, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS (ration)', min: 0, max: 3000 },
  { key: 'pork.labor_vet', commodityId: 'pork', label: 'Labor, vet & yardage', value: 200, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA ERS', min: 0, max: 1500 },
  { key: 'pork.processing', commodityId: 'pork', label: 'Processing & packing', value: 350, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA AMS, packer margins', min: 0, max: 2000 },
  { key: 'pork.cold_freight', commodityId: 'pork', label: 'Cold-chain logistics', value: 200, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'reefer freight quotes', min: 0, max: 1500 },

  // Eggs (USD/tonne)
  { key: 'eggs.pullet', commodityId: 'eggs', label: 'Pullet', value: 300, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA / industry layer economics', min: 0, max: 1500 },
  { key: 'eggs.feed', commodityId: 'eggs', label: 'Feed', value: 1200, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'USDA (layer ration)', min: 0, max: 4000 },
  { key: 'eggs.labor', commodityId: 'eggs', label: 'Labor & farm overhead', value: 250, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'industry economics', min: 0, max: 1500 },
  { key: 'eggs.grading', commodityId: 'eggs', label: 'Grading & packing', value: 200, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'packing-plant costs', min: 0, max: 1500 },
  { key: 'eggs.cold_freight', commodityId: 'eggs', label: 'Cold-chain logistics', value: 200, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'reefer freight quotes', min: 0, max: 1500 },

  // Fertilizer / urea (USD/tonne)
  { key: 'fertilizer.gas_feedstock', commodityId: 'fertilizer', label: 'Natural-gas feedstock', value: 150, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'World Bank / industry urea cost build-up', min: 0, max: 700 },
  { key: 'fertilizer.ammonia_synthesis', commodityId: 'fertilizer', label: 'Ammonia synthesis', value: 60, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'producer cost build-up', min: 0, max: 300 },
  { key: 'fertilizer.granulation', commodityId: 'fertilizer', label: 'Urea granulation', value: 30, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'producer cost build-up', min: 0, max: 150 },
  { key: 'fertilizer.bagging', commodityId: 'fertilizer', label: 'Bagging & handling', value: 20, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'terminal handling', min: 0, max: 100 },
  { key: 'fertilizer.freight', commodityId: 'fertilizer', label: 'Ocean freight', value: 40, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'Baltic / fertilizer freight', min: 0, max: 200 },

  // ── Critical minerals (USD/tonne; uranium USD/tU). MODELED per research. ──
  { key: 'lithium.mining', commodityId: 'lithium', label: 'Mining / concentrate', value: 600, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'Spodumene ~$730/t FOB 2024 (Fastmarkets/USGS)', min: 0, max: 5000 },
  { key: 'lithium.refining', commodityId: 'lithium', label: 'Conversion to carbonate/hydroxide', value: 3000, unit: 'USD/t LCE', provenance: 'MODELED', sourceNote: 'Industry consensus spodumene→carbonate', min: 0, max: 10000 },
  { key: 'lithium.freight', commodityId: 'lithium', label: 'Freight & handling', value: 80, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'container/bulk lane quotes', min: 0, max: 500 },
  { key: 'cobalt.mining', commodityId: 'cobalt', label: 'Mining (by-product basis)', value: 3000, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'DRC Cu/Ni by-product credit', min: 0, max: 20000 },
  { key: 'cobalt.refining', commodityId: 'cobalt', label: 'Refining (battery-grade)', value: 5000, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'China conversion estimate', min: 0, max: 15000 },
  { key: 'cobalt.freight', commodityId: 'cobalt', label: 'Freight & handling', value: 80, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'lane quotes', min: 0, max: 500 },
  { key: 'graphite.mining', commodityId: 'graphite', label: 'Flake mining/concentration', value: 500, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'Flake ~$1,070/t import 2024 (USGS)', min: 0, max: 3000 },
  { key: 'graphite.refining', commodityId: 'graphite', label: 'Spherical/anode processing', value: 2000, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'purification + ~30–40% yield loss', min: 0, max: 6000 },
  { key: 'graphite.freight', commodityId: 'graphite', label: 'Freight & handling', value: 60, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'bulk lane quotes', min: 0, max: 400 },
  { key: 'manganese.mining', commodityId: 'manganese', label: 'Ore mining', value: 255, unit: 'USD/t', provenance: 'MODELED', sourceNote: '~$5.80/dmtu × 44% Mn (CRU/USGS 2024)', min: 0, max: 1500 },
  { key: 'manganese.refining', commodityId: 'manganese', label: 'Ferroalloy / HPMSM', value: 1500, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'alloy/battery-grade conversion', min: 0, max: 6000 },
  { key: 'manganese.freight', commodityId: 'manganese', label: 'Bulk freight', value: 40, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'Baltic Dry', min: 0, max: 250 },
  { key: 'titanium.mining', commodityId: 'titanium', label: 'Ilmenite mining', value: 340, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'Ilmenite ~$340–500/t 2024 (USGS)', min: 0, max: 2000 },
  { key: 'titanium.refining', commodityId: 'titanium', label: 'Sponge (Kroll) conversion', value: 8500, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'Sponge import ~$13/kg 2024', min: 0, max: 20000 },
  { key: 'titanium.freight', commodityId: 'titanium', label: 'Freight & handling', value: 120, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'lane quotes', min: 0, max: 600 },
  { key: 'tungsten.mining', commodityId: 'tungsten', label: 'Concentrate mining', value: 24000, unit: 'USD/t W', provenance: 'MODELED', sourceNote: '~$185/mtu WO₃ × 7.93 kg W/mtu', min: 0, max: 60000 },
  { key: 'tungsten.refining', commodityId: 'tungsten', label: 'APT / carbide conversion', value: 6000, unit: 'USD/t W', provenance: 'MODELED', sourceNote: '~$30–60/mtu added (Argus)', min: 0, max: 20000 },
  { key: 'tungsten.freight', commodityId: 'tungsten', label: 'Freight & handling', value: 100, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'lane quotes', min: 0, max: 500 },
  { key: 'uranium.mining', commodityId: 'uranium', label: 'Mining (ISL/conventional)', value: 70000, unit: 'USD/tU', provenance: 'MODELED', sourceNote: '~$27/lb U₃O₈ cash cost (WNA)', min: 0, max: 300000 },
  { key: 'uranium.conversion', commodityId: 'uranium', label: 'Conversion (UF₆)', value: 25000, unit: 'USD/tU', provenance: 'MODELED', sourceNote: '~$15–25/kgU conversion (UxC)', min: 0, max: 100000 },
  { key: 'uranium.enrichment', commodityId: 'uranium', label: 'Enrichment (SWU)', value: 120000, unit: 'USD/tU', provenance: 'MODELED', sourceNote: '~$100–160/SWU 2024 (UxC); the binding chokepoint', min: 0, max: 400000 },
  { key: 'uranium.haleu', commodityId: 'uranium', label: 'HALEU enrichment (5–20%)', value: 200000, unit: 'USD/tU', provenance: 'MODELED', sourceNote: 'Premium; Centrus only Western producer (demo scale)', min: 0, max: 600000 },
  { key: 'uranium.freight', commodityId: 'uranium', label: 'Fuel fabrication & transport', value: 8000, unit: 'USD/tU', provenance: 'MODELED', sourceNote: 'fabrication (incl. TRISO) + certified-cask logistics', min: 0, max: 40000 },

  // ── Rare earths: NdFeB magnets & RE compounds (USD/kg / USD/t). MODELED. ──
  { key: 'ndfeb_magnets.oxide', commodityId: 'ndfeb_magnets', label: 'Magnet RE oxides (NdPr+Dy)', value: 60, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'NdPr oxide content (Argus/Fastmarkets, paid)', min: 0, max: 400 },
  { key: 'ndfeb_magnets.alloy', commodityId: 'ndfeb_magnets', label: 'Metal & strip-cast alloy', value: 10, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'reduction + alloy (DOE)', min: 0, max: 60 },
  { key: 'ndfeb_magnets.sintering', commodityId: 'ndfeb_magnets', label: 'Sintering & magnet-making', value: 20, unit: 'USD/kg', provenance: 'MODELED', sourceNote: '~$15–25/kg conversion (Thunder Said Energy)', min: 0, max: 80 },
  { key: 'ndfeb_magnets.freight', commodityId: 'ndfeb_magnets', label: 'Freight & handling', value: 2, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'lane quotes', min: 0, max: 20 },
  { key: 're_compounds.mining', commodityId: 're_compounds', label: 'Mining', value: 5, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'RE-bearing ore extraction', min: 0, max: 40 },
  { key: 're_compounds.beneficiation', commodityId: 're_compounds', label: 'Beneficiation', value: 4, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'flotation → concentrate', min: 0, max: 30 },
  { key: 're_compounds.separation', commodityId: 're_compounds', label: 'Separation (solvent extraction)', value: 12, unit: 'USD/kg', provenance: 'MODELED', sourceNote: '~$5–15/kg light-RE (DOE); ~90% China', min: 0, max: 60 },
  { key: 're_compounds.reduction', commodityId: 're_compounds', label: 'Oxide → metal', value: 8, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'reduction to metal', min: 0, max: 50 },
  { key: 're_compounds.freight_pct', commodityId: 're_compounds', label: 'Freight & handling', value: 3, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'secured freight', min: 0, max: 20 },

  // ── Semiconductor materials (polysilicon USD/t; gallium/germanium USD/kg). ──
  { key: 'polysilicon.production', commodityId: 'polysilicon', label: 'Siemens-process polysilicon', value: 8000, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'Solar marker ~$8/kg 2023 (Bernreuter)', min: 0, max: 60000 },
  { key: 'polysilicon.purification', commodityId: 'polysilicon', label: 'Electronic-grade + wafer pull', value: 30000, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'EG premium (no public quote)', min: 0, max: 80000 },
  { key: 'polysilicon.freight', commodityId: 'polysilicon', label: 'Freight & handling', value: 100, unit: 'USD/t', provenance: 'MODELED', sourceNote: 'lane quotes', min: 0, max: 600 },
  { key: 'gallium.production', commodityId: 'gallium', label: 'Low-purity primary gallium', value: 350, unit: 'USD/kg', provenance: 'MODELED', sourceNote: '~$300–400/kg 2023 (USGS)', min: 0, max: 1000 },
  { key: 'gallium.purification', commodityId: 'gallium', label: 'High-purity (4N–7N) refining', value: 200, unit: 'USD/kg', provenance: 'MODELED', sourceNote: '~$450–600/kg refined (USGS)', min: 0, max: 800 },
  { key: 'gallium.freight', commodityId: 'gallium', label: 'Freight & handling', value: 5, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'specialised packaging', min: 0, max: 50 },
  { key: 'germanium.production', commodityId: 'germanium', label: 'Germanium (GeO₂) recovery', value: 880, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'GeO₂ ~$880/kg 2023 (USGS)', min: 0, max: 2000 },
  { key: 'germanium.purification', commodityId: 'germanium', label: 'Zone-refined 5N metal', value: 600, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'Metal ~$1,400–1,600/kg 2023 (USGS/Argus)', min: 0, max: 2000 },
  { key: 'germanium.freight', commodityId: 'germanium', label: 'Freight & handling', value: 10, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'specialised packaging', min: 0, max: 80 },

  // ── Semiconductor devices & equipment (USD/kg of finished good; illustrative). ──
  { key: 'integrated_circuits.design', commodityId: 'integrated_circuits', label: 'Design (EDA/IP, amortized)', value: 2000, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'illustrative — value-traded good', min: 0, max: 20000 },
  { key: 'integrated_circuits.fab', commodityId: 'integrated_circuits', label: 'Wafer fabrication', value: 8000, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'leading-edge wafer ~$17–20k/3nm 300mm', min: 0, max: 40000 },
  { key: 'integrated_circuits.assembly', commodityId: 'integrated_circuits', label: 'Assembly, test & packaging', value: 1500, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'illustrative back-end', min: 0, max: 10000 },
  { key: 'integrated_circuits.logistics', commodityId: 'integrated_circuits', label: 'Secured air freight', value: 500, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'high-value air cargo', min: 0, max: 5000 },
  { key: 'semiconductor_devices.design', commodityId: 'semiconductor_devices', label: 'Design (amortized)', value: 800, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'illustrative — value-traded good', min: 0, max: 10000 },
  { key: 'semiconductor_devices.fab', commodityId: 'semiconductor_devices', label: 'Wafer fabrication (discrete/power)', value: 3000, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'illustrative; GaN/SiC premium 3–5×', min: 0, max: 20000 },
  { key: 'semiconductor_devices.assembly', commodityId: 'semiconductor_devices', label: 'Assembly, test & packaging', value: 700, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'illustrative back-end', min: 0, max: 6000 },
  { key: 'semiconductor_devices.logistics', commodityId: 'semiconductor_devices', label: 'Air freight', value: 300, unit: 'USD/kg', provenance: 'MODELED', sourceNote: 'air cargo', min: 0, max: 3000 },
  { key: 'semicon_equipment.subsystems', commodityId: 'semicon_equipment', label: 'Precision optics & subsystems', value: 40, unit: 'M USD/tool', provenance: 'MODELED', sourceNote: 'EUV optics/lasers (Zeiss/Trumpf)', min: 0, max: 200 },
  { key: 'semicon_equipment.integration', commodityId: 'semicon_equipment', label: 'System integration (EUV)', value: 120, unit: 'M USD/tool', provenance: 'MODELED', sourceNote: 'EUV scanner ~$150–200M (ASML)', min: 0, max: 400 },
  { key: 'semicon_equipment.install', commodityId: 'semicon_equipment', label: 'Install & field service', value: 15, unit: 'M USD/tool', provenance: 'MODELED', sourceNote: 'ship/install/service', min: 0, max: 100 },

  // ── Industrial chemicals (USD/tonne). MODELED per research. ──
  { key: 'ammonia.feedstock', commodityId: 'ammonia', label: 'Natural-gas feedstock', value: 350, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: '~33–36 MMBtu/t × $4–7/MMBtu', min: 0, max: 1500 },
  { key: 'ammonia.production', commodityId: 'ammonia', label: 'Haber-Bosch conversion', value: 150, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'opex above feedstock', min: 0, max: 600 },
  { key: 'ammonia.freight', commodityId: 'ammonia', label: 'Refrigerated/ISO freight', value: 60, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'ammonia gas carrier', min: 0, max: 300 },
  { key: 'methanol.feedstock', commodityId: 'methanol', label: 'Gas/coal feedstock', value: 250, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: '~33–36 MMBtu/t feedstock', min: 0, max: 1000 },
  { key: 'methanol.production', commodityId: 'methanol', label: 'Synthesis conversion', value: 100, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'opex above feedstock', min: 0, max: 500 },
  { key: 'methanol.freight', commodityId: 'methanol', label: 'Chemical tanker freight', value: 50, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'methanol tanker lane', min: 0, max: 300 },
  { key: 'ethylene.feedstock', commodityId: 'ethylene', label: 'Naphtha/ethane feedstock', value: 700, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: '~3 t naphtha/t before credits', min: 0, max: 2000 },
  { key: 'ethylene.production', commodityId: 'ethylene', label: 'Steam cracking', value: 200, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'cracker opex', min: 0, max: 800 },
  { key: 'ethylene.freight', commodityId: 'ethylene', label: 'Refrigerated gas freight', value: 120, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'mostly captive — small merchant trade', min: 0, max: 500 },
  { key: 'sulfuric_acid.feedstock', commodityId: 'sulfuric_acid', label: 'Sulfur (by-product)', value: 40, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: '~0.34 t S/t acid × $80–250/t S', min: 0, max: 300 },
  { key: 'sulfuric_acid.production', commodityId: 'sulfuric_acid', label: 'Contact-process / smelter acid', value: 40, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'sulfur-burning plant opex', min: 0, max: 200 },
  { key: 'sulfuric_acid.freight', commodityId: 'sulfuric_acid', label: 'Acid tanker freight', value: 30, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'low-value/high-corrosivity — freight-dominated', min: 0, max: 200 },
  { key: 'caustic_soda.feedstock', commodityId: 'caustic_soda', label: 'Power (electrolysis)', value: 180, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: '~2,200 kWh/t × $0.05–0.11/kWh', min: 0, max: 600 },
  { key: 'caustic_soda.production', commodityId: 'caustic_soda', label: 'Chlor-alkali opex', value: 120, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'before chlorine co-product credit', min: 0, max: 500 },
  { key: 'caustic_soda.freight', commodityId: 'caustic_soda', label: 'Liquid lye freight', value: 60, unit: 'USD/tonne', provenance: 'MODELED', sourceNote: 'traded 50% liquor; priced 100% basis', min: 0, max: 300 },
];

export function paramsForCommodity(commodityId: string): CostParameter[] {
  return COST_PARAMETERS.filter((p) => p.commodityId === commodityId);
}

export function paramMap(commodityId: string): Record<string, CostParameter> {
  return Object.fromEntries(paramsForCommodity(commodityId).map((p) => [p.key, p]));
}
