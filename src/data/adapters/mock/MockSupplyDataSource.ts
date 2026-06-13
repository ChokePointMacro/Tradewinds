import type {
  CommodityPortActivity,
  CountryProduction,
  CountryReserves,
  CountryTradeBalance,
} from '@/types';
import type { SupplyDataSource } from '../types';
import { portActivityFor } from '@/data/ports/portActivity';

// Illustrative annual production/reserves (PRD 10.4). Live data comes from USGS
// (metals) and EIA (oil) later; values here are SOURCED-shaped placeholders for
// UI layout, labelled with a data year. DATA-SUPPLY-YEAR-1: show year prominently.
const YEAR = 2024;

const PRODUCTION: Record<string, CountryProduction[]> = {
  crude_oil: [
    { country: 'United States', amount: 13.2, unit: 'Mbbl/d', year: YEAR },
    { country: 'Saudi Arabia', amount: 9.7, unit: 'Mbbl/d', year: YEAR },
    { country: 'Russia', amount: 9.4, unit: 'Mbbl/d', year: YEAR },
    { country: 'Canada', amount: 4.9, unit: 'Mbbl/d', year: YEAR },
    { country: 'Iraq', amount: 4.3, unit: 'Mbbl/d', year: YEAR },
  ],
  gold: [
    { country: 'China', amount: 370, unit: 't/yr', year: YEAR },
    { country: 'Australia', amount: 310, unit: 't/yr', year: YEAR },
    { country: 'Russia', amount: 310, unit: 't/yr', year: YEAR },
    { country: 'Canada', amount: 200, unit: 't/yr', year: YEAR },
    { country: 'United States', amount: 170, unit: 't/yr', year: YEAR },
  ],
  silver: [
    { country: 'Mexico', amount: 6300, unit: 't/yr', year: YEAR },
    { country: 'China', amount: 3400, unit: 't/yr', year: YEAR },
    { country: 'Peru', amount: 3100, unit: 't/yr', year: YEAR },
    { country: 'Chile', amount: 1400, unit: 't/yr', year: YEAR },
    { country: 'Poland', amount: 1300, unit: 't/yr', year: YEAR },
  ],
  copper: [
    { country: 'Chile', amount: 5300, unit: 'kt/yr', year: YEAR },
    { country: 'Peru', amount: 2600, unit: 'kt/yr', year: YEAR },
    { country: 'DR Congo', amount: 2500, unit: 'kt/yr', year: YEAR },
    { country: 'China', amount: 1800, unit: 'kt/yr', year: YEAR },
    { country: 'United States', amount: 1100, unit: 'kt/yr', year: YEAR },
  ],
  nickel: [
    { country: 'Indonesia', amount: 2200, unit: 'kt/yr', year: YEAR },
    { country: 'Philippines', amount: 330, unit: 'kt/yr', year: YEAR },
    { country: 'Russia', amount: 200, unit: 'kt/yr', year: YEAR },
    { country: 'New Caledonia', amount: 190, unit: 'kt/yr', year: YEAR },
    { country: 'Australia', amount: 160, unit: 'kt/yr', year: YEAR },
  ],
  palladium: [
    { country: 'Russia', amount: 88, unit: 't/yr', year: YEAR },
    { country: 'South Africa', amount: 74, unit: 't/yr', year: YEAR },
    { country: 'Canada', amount: 17, unit: 't/yr', year: YEAR },
    { country: 'United States', amount: 14, unit: 't/yr', year: YEAR },
    { country: 'Zimbabwe', amount: 12, unit: 't/yr', year: YEAR },
  ],
  diesel: [
    { country: 'United States', amount: 5.0, unit: 'Mbbl/d', year: YEAR },
    { country: 'China', amount: 3.6, unit: 'Mbbl/d', year: YEAR },
    { country: 'India', amount: 1.8, unit: 'Mbbl/d', year: YEAR },
    { country: 'Russia', amount: 1.6, unit: 'Mbbl/d', year: YEAR },
    { country: 'Saudi Arabia', amount: 1.0, unit: 'Mbbl/d', year: YEAR },
  ],
};

const RESERVES: Record<string, CountryReserves[]> = {
  crude_oil: [
    { country: 'Venezuela', amount: 303, unit: 'Gbbl', year: YEAR },
    { country: 'Saudi Arabia', amount: 267, unit: 'Gbbl', year: YEAR },
    { country: 'Iran', amount: 209, unit: 'Gbbl', year: YEAR },
  ],
  gold: [
    { country: 'Australia', amount: 12000, unit: 't', year: YEAR },
    { country: 'Russia', amount: 11000, unit: 't', year: YEAR },
    { country: 'South Africa', amount: 5000, unit: 't', year: YEAR },
  ],
  silver: [
    { country: 'Peru', amount: 98000, unit: 't', year: YEAR },
    { country: 'Australia', amount: 94000, unit: 't', year: YEAR },
    { country: 'China', amount: 72000, unit: 't', year: YEAR },
  ],
  copper: [
    { country: 'Chile', amount: 190000, unit: 'kt', year: YEAR },
    { country: 'Australia', amount: 100000, unit: 'kt', year: YEAR },
    { country: 'Peru', amount: 100000, unit: 'kt', year: YEAR },
  ],
  nickel: [
    { country: 'Indonesia', amount: 55000, unit: 'kt', year: YEAR },
    { country: 'Australia', amount: 24000, unit: 'kt', year: YEAR },
    { country: 'Brazil', amount: 16000, unit: 'kt', year: YEAR },
  ],
  palladium: [
    { country: 'South Africa', amount: 21000, unit: 't', year: YEAR },
    { country: 'Russia', amount: 3900, unit: 't', year: YEAR },
    { country: 'United States', amount: 900, unit: 't', year: YEAR },
  ],
};

// Net trade balance (positive = net exporter, negative = net importer). Illustrative
// MODELED seed values — directionally representative, not a sourced trade dataset.
const NET_TRADE: Record<string, CountryTradeBalance[]> = {
  crude_oil: [
    { country: 'Saudi Arabia', netExport: 6.3, unit: 'Mbbl/d', year: YEAR },
    { country: 'Russia', netExport: 4.7, unit: 'Mbbl/d', year: YEAR },
    { country: 'Canada', netExport: 3.4, unit: 'Mbbl/d', year: YEAR },
    { country: 'Iraq', netExport: 3.3, unit: 'Mbbl/d', year: YEAR },
    { country: 'United States', netExport: -2.4, unit: 'Mbbl/d', year: YEAR },
    { country: 'India', netExport: -4.6, unit: 'Mbbl/d', year: YEAR },
    { country: 'China', netExport: -11.3, unit: 'Mbbl/d', year: YEAR },
  ],
  diesel: [
    { country: 'United States', netExport: 1.0, unit: 'Mbbl/d', year: YEAR },
    { country: 'Russia', netExport: 0.8, unit: 'Mbbl/d', year: YEAR },
    { country: 'India', netExport: 0.5, unit: 'Mbbl/d', year: YEAR },
    { country: 'Saudi Arabia', netExport: 0.4, unit: 'Mbbl/d', year: YEAR },
    { country: 'France', netExport: -0.4, unit: 'Mbbl/d', year: YEAR },
    { country: 'Germany', netExport: -0.5, unit: 'Mbbl/d', year: YEAR },
  ],
  gold: [
    { country: 'Australia', netExport: 290, unit: 't/yr', year: YEAR },
    { country: 'Russia', netExport: 250, unit: 't/yr', year: YEAR },
    { country: 'Canada', netExport: 180, unit: 't/yr', year: YEAR },
    { country: 'South Africa', netExport: 90, unit: 't/yr', year: YEAR },
    { country: 'India', netExport: -700, unit: 't/yr', year: YEAR },
    { country: 'China', netExport: -600, unit: 't/yr', year: YEAR },
  ],
  silver: [
    { country: 'Mexico', netExport: 5000, unit: 't/yr', year: YEAR },
    { country: 'Peru', netExport: 2500, unit: 't/yr', year: YEAR },
    { country: 'Poland', netExport: 1000, unit: 't/yr', year: YEAR },
    { country: 'India', netExport: -5000, unit: 't/yr', year: YEAR },
    { country: 'United States', netExport: -3000, unit: 't/yr', year: YEAR },
  ],
  copper: [
    { country: 'Chile', netExport: 4800, unit: 'kt/yr', year: YEAR },
    { country: 'Peru', netExport: 2400, unit: 'kt/yr', year: YEAR },
    { country: 'DR Congo', netExport: 1800, unit: 'kt/yr', year: YEAR },
    { country: 'China', netExport: -3600, unit: 'kt/yr', year: YEAR },
    { country: 'Germany', netExport: -600, unit: 'kt/yr', year: YEAR },
  ],
  nickel: [
    { country: 'Indonesia', netExport: 1200, unit: 'kt/yr', year: YEAR },
    { country: 'Philippines', netExport: 300, unit: 'kt/yr', year: YEAR },
    { country: 'Russia', netExport: 180, unit: 'kt/yr', year: YEAR },
    { country: 'New Caledonia', netExport: 150, unit: 'kt/yr', year: YEAR },
    { country: 'China', netExport: -900, unit: 'kt/yr', year: YEAR },
    { country: 'Japan', netExport: -200, unit: 'kt/yr', year: YEAR },
  ],
  palladium: [
    { country: 'Russia', netExport: 80, unit: 't/yr', year: YEAR },
    { country: 'South Africa', netExport: 70, unit: 't/yr', year: YEAR },
    { country: 'China', netExport: -90, unit: 't/yr', year: YEAR },
    { country: 'United States', netExport: -30, unit: 't/yr', year: YEAR },
    { country: 'Japan', netExport: -25, unit: 't/yr', year: YEAR },
  ],
};

export class MockSupplyDataSource implements SupplyDataSource {
  async getProductionByCountry(commodityId: string): Promise<CountryProduction[]> {
    return PRODUCTION[commodityId] ?? [];
  }

  async getReserves(commodityId: string): Promise<CountryReserves[]> {
    return RESERVES[commodityId] ?? [];
  }

  async getNetTrade(commodityId: string): Promise<CountryTradeBalance[]> {
    return NET_TRADE[commodityId] ?? [];
  }

  async getPortActivity(commodityId: string): Promise<CommodityPortActivity[]> {
    return portActivityFor(commodityId);
  }
}
