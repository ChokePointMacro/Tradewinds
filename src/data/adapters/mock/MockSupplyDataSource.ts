import type { CommodityPortActivity, CountryTradeBalance } from '@/types';
import type { SupplyDataSource } from '../types';
import { portActivityFor } from '@/data/ports/portActivity';
import { productionFor, reservesFor } from '@/data/supply/reservesProduction';

// Production & reserves are now served from the SOURCED dataset module
// (src/data/supply/reservesProduction.ts — USGS/EIA cited, with asOf year).
// Net trade + ports below are still seed-backed pending their own conversion
// off mock (see PRODUCTION_AUDIT.md).
const YEAR = 2024;

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
  async getProductionByCountry(commodityId: string) {
    return productionFor(commodityId);
  }

  async getReserves(commodityId: string) {
    return reservesFor(commodityId);
  }

  async getNetTrade(commodityId: string): Promise<CountryTradeBalance[]> {
    // Tag seed rows MODELED so the overlay badge stays honest when the live
    // Comtrade path is off or falls back to this seed data.
    return (NET_TRADE[commodityId] ?? []).map((r) => ({ ...r, provenance: 'MODELED' as const }));
  }

  async getPortActivity(commodityId: string): Promise<CommodityPortActivity[]> {
    return portActivityFor(commodityId);
  }
}
