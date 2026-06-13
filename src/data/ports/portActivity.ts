import type { CommodityPortActivity } from '@/types';

// Busiest ports / trading hubs per commodity (Ports tab). Headline `volume` is a
// SOURCED-shaped seed figure (curated from public throughput rankings — Lloyd's
// List, World Shipping Council, LBMA/exchange clearing, EIA/JODI flows) and is
// badged SOURCED·seed in the UI. `valueDeclaredUsdB`, `cargoMix` and `partners`
// are MODELED / illustrative and badged accordingly. Lists are pre-sorted by
// `volume` descending. DATA-PORTS-1: replace with a live trade/throughput feed
// (UN Comtrade, port authorities) before trusting specific numbers.
const YEAR = 2024;

export const PORT_ACTIVITY: Record<string, CommodityPortActivity[]> = {
  crude_oil: [
    {
      id: 'ras_tanura', commodityId: 'crude_oil', name: 'Ras Tanura', country: 'Saudi Arabia',
      lat: 26.64, lng: 50.16, role: 'export', volume: 3.5, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 110, cargoType: 'Crude oil',
      cargoMix: [{ label: 'Arabian Light', sharePct: 62 }, { label: 'Arabian Heavy', sharePct: 28 }, { label: 'Condensate', sharePct: 10 }],
      partners: [{ country: 'China', sharePct: 34, direction: 'export' }, { country: 'India', sharePct: 18, direction: 'export' }, { country: 'South Korea', sharePct: 14, direction: 'export' }, { country: 'Japan', sharePct: 11, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'ningbo_zhoushan_oil', commodityId: 'crude_oil', name: 'Ningbo-Zhoushan', country: 'China',
      lat: 29.87, lng: 121.55, role: 'import', volume: 2.8, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 88, cargoType: 'Crude oil (import)',
      cargoMix: [{ label: 'Medium sour', sharePct: 55 }, { label: 'Light sweet', sharePct: 30 }, { label: 'Heavy', sharePct: 15 }],
      partners: [{ country: 'Saudi Arabia', sharePct: 26, direction: 'import' }, { country: 'Russia', sharePct: 22, direction: 'import' }, { country: 'Iraq', sharePct: 15, direction: 'import' }, { country: 'UAE', sharePct: 10, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'rotterdam_oil', commodityId: 'crude_oil', name: 'Rotterdam', country: 'Netherlands',
      lat: 51.95, lng: 4.14, role: 'hub', volume: 2.5, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 79, cargoType: 'Crude & products',
      cargoMix: [{ label: 'Crude', sharePct: 60 }, { label: 'Fuel oil', sharePct: 25 }, { label: 'Gasoil', sharePct: 15 }],
      partners: [{ country: 'United States', sharePct: 24, direction: 'import' }, { country: 'Norway', sharePct: 18, direction: 'import' }, { country: 'Nigeria', sharePct: 12, direction: 'import' }, { country: 'Germany', sharePct: 20, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'houston_oil', commodityId: 'crude_oil', name: 'Houston', country: 'United States',
      lat: 29.75, lng: -95.06, role: 'hub', volume: 2.2, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 70, cargoType: 'Crude oil',
      cargoMix: [{ label: 'WTI', sharePct: 70 }, { label: 'Condensate', sharePct: 18 }, { label: 'Sour blends', sharePct: 12 }],
      partners: [{ country: 'Netherlands', sharePct: 16, direction: 'export' }, { country: 'South Korea', sharePct: 14, direction: 'export' }, { country: 'China', sharePct: 12, direction: 'export' }, { country: 'India', sharePct: 11, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'fujairah_oil', commodityId: 'crude_oil', name: 'Fujairah', country: 'United Arab Emirates',
      lat: 25.16, lng: 56.35, role: 'hub', volume: 1.6, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 50, cargoType: 'Crude & bunker',
      cargoMix: [{ label: 'Crude', sharePct: 55 }, { label: 'Fuel oil/bunker', sharePct: 35 }, { label: 'Condensate', sharePct: 10 }],
      partners: [{ country: 'India', sharePct: 22, direction: 'export' }, { country: 'China', sharePct: 20, direction: 'export' }, { country: 'Singapore', sharePct: 16, direction: 'export' }, { country: 'Pakistan', sharePct: 9, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'primorsk_oil', commodityId: 'crude_oil', name: 'Primorsk', country: 'Russia',
      lat: 60.34, lng: 28.61, role: 'export', volume: 1.4, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 38, cargoType: 'Crude oil (Urals)',
      cargoMix: [{ label: 'Urals', sharePct: 88 }, { label: 'Light blends', sharePct: 12 }],
      partners: [{ country: 'India', sharePct: 38, direction: 'export' }, { country: 'China', sharePct: 30, direction: 'export' }, { country: 'Turkey', sharePct: 14, direction: 'export' }],
      year: YEAR,
    },
  ],

  diesel: [
    {
      id: 'singapore_diesel', commodityId: 'diesel', name: 'Singapore', country: 'Singapore',
      lat: 1.26, lng: 103.84, role: 'hub', volume: 1.4, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 60, cargoType: 'Middle distillates',
      cargoMix: [{ label: 'Gasoil/diesel', sharePct: 72 }, { label: 'Jet/kero', sharePct: 18 }, { label: 'Blendstock', sharePct: 10 }],
      partners: [{ country: 'Australia', sharePct: 20, direction: 'export' }, { country: 'Indonesia', sharePct: 18, direction: 'export' }, { country: 'Vietnam', sharePct: 14, direction: 'export' }, { country: 'Middle East', sharePct: 22, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'rotterdam_diesel', commodityId: 'diesel', name: 'Rotterdam (ARA)', country: 'Netherlands',
      lat: 51.95, lng: 4.14, role: 'hub', volume: 1.0, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 43, cargoType: 'Diesel / gasoil',
      cargoMix: [{ label: 'ULSD 10ppm', sharePct: 80 }, { label: 'Heating oil', sharePct: 12 }, { label: 'Biodiesel blend', sharePct: 8 }],
      partners: [{ country: 'Germany', sharePct: 26, direction: 'export' }, { country: 'United Kingdom', sharePct: 16, direction: 'export' }, { country: 'United States', sharePct: 18, direction: 'import' }, { country: 'India', sharePct: 12, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'houston_diesel', commodityId: 'diesel', name: 'Houston', country: 'United States',
      lat: 29.75, lng: -95.06, role: 'export', volume: 0.9, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 39, cargoType: 'ULSD',
      cargoMix: [{ label: 'ULSD', sharePct: 86 }, { label: 'Off-road diesel', sharePct: 9 }, { label: 'Biodiesel', sharePct: 5 }],
      partners: [{ country: 'Mexico', sharePct: 34, direction: 'export' }, { country: 'Brazil', sharePct: 18, direction: 'export' }, { country: 'Chile', sharePct: 12, direction: 'export' }, { country: 'Netherlands', sharePct: 10, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'fujairah_diesel', commodityId: 'diesel', name: 'Fujairah', country: 'United Arab Emirates',
      lat: 25.16, lng: 56.35, role: 'hub', volume: 0.8, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 34, cargoType: 'Gasoil / bunker',
      cargoMix: [{ label: 'Gasoil', sharePct: 64 }, { label: 'Marine gasoil', sharePct: 26 }, { label: 'Jet', sharePct: 10 }],
      partners: [{ country: 'East Africa', sharePct: 24, direction: 'export' }, { country: 'India', sharePct: 18, direction: 'import' }, { country: 'Pakistan', sharePct: 16, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'jamnagar_diesel', commodityId: 'diesel', name: 'Jamnagar', country: 'India',
      lat: 22.47, lng: 69.84, role: 'export', volume: 0.7, volumeUnit: 'Mbbl/d',
      valueDeclaredUsdB: 30, cargoType: 'Diesel (export refinery)',
      cargoMix: [{ label: 'ULSD', sharePct: 82 }, { label: 'Gasoil', sharePct: 18 }],
      partners: [{ country: 'Europe', sharePct: 30, direction: 'export' }, { country: 'East Africa', sharePct: 22, direction: 'export' }, { country: 'Singapore', sharePct: 16, direction: 'export' }],
      year: YEAR,
    },
  ],

  gold: [
    {
      id: 'london_gold', commodityId: 'gold', name: 'London (LBMA)', country: 'United Kingdom',
      lat: 51.51, lng: -0.13, role: 'hub', volume: 7300, volumeUnit: 't/yr',
      valueDeclaredUsdB: 990, cargoType: 'Good Delivery bullion',
      cargoMix: [{ label: '400oz bars', sharePct: 78 }, { label: 'Allocated vault', sharePct: 16 }, { label: 'Kilobars', sharePct: 6 }],
      partners: [{ country: 'Switzerland', sharePct: 34, direction: 'export' }, { country: 'United States', sharePct: 20, direction: 'import' }, { country: 'India', sharePct: 12, direction: 'export' }, { country: 'China', sharePct: 10, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'zurich_gold', commodityId: 'gold', name: 'Zurich', country: 'Switzerland',
      lat: 47.37, lng: 8.54, role: 'hub', volume: 2600, volumeUnit: 't/yr',
      valueDeclaredUsdB: 350, cargoType: 'Refined bullion',
      cargoMix: [{ label: 'Kilobars', sharePct: 58 }, { label: '400oz bars', sharePct: 34 }, { label: 'Coins/blanks', sharePct: 8 }],
      partners: [{ country: 'India', sharePct: 24, direction: 'export' }, { country: 'China', sharePct: 20, direction: 'export' }, { country: 'United Kingdom', sharePct: 18, direction: 'import' }, { country: 'Turkey', sharePct: 9, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'hongkong_gold', commodityId: 'gold', name: 'Hong Kong', country: 'Hong Kong',
      lat: 22.32, lng: 114.17, role: 'import', volume: 1500, volumeUnit: 't/yr',
      valueDeclaredUsdB: 200, cargoType: 'Bullion & jewellery stock',
      cargoMix: [{ label: 'Kilobars', sharePct: 70 }, { label: 'Jewellery grain', sharePct: 22 }, { label: 'Coins', sharePct: 8 }],
      partners: [{ country: 'China', sharePct: 52, direction: 'export' }, { country: 'Switzerland', sharePct: 18, direction: 'import' }, { country: 'Australia', sharePct: 10, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'dubai_gold', commodityId: 'gold', name: 'Dubai (DMCC)', country: 'United Arab Emirates',
      lat: 25.20, lng: 55.27, role: 'hub', volume: 900, volumeUnit: 't/yr',
      valueDeclaredUsdB: 120, cargoType: 'Bullion & scrap',
      cargoMix: [{ label: 'Kilobars', sharePct: 64 }, { label: 'Scrap/doré', sharePct: 26 }, { label: 'Jewellery', sharePct: 10 }],
      partners: [{ country: 'India', sharePct: 30, direction: 'export' }, { country: 'Switzerland', sharePct: 20, direction: 'export' }, { country: 'East Africa', sharePct: 16, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'shanghai_gold', commodityId: 'gold', name: 'Shanghai (SGE)', country: 'China',
      lat: 31.23, lng: 121.47, role: 'import', volume: 1700, volumeUnit: 't/yr',
      valueDeclaredUsdB: 230, cargoType: 'Bullion (domestic delivery)',
      cargoMix: [{ label: 'Standard kilobars', sharePct: 84 }, { label: '100g bars', sharePct: 12 }, { label: 'Coins', sharePct: 4 }],
      partners: [{ country: 'Switzerland', sharePct: 30, direction: 'import' }, { country: 'Hong Kong', sharePct: 22, direction: 'import' }, { country: 'Australia', sharePct: 14, direction: 'import' }],
      year: YEAR,
    },
  ],

  silver: [
    {
      id: 'london_silver', commodityId: 'silver', name: 'London (LBMA)', country: 'United Kingdom',
      lat: 51.51, lng: -0.13, role: 'hub', volume: 22000, volumeUnit: 't/yr',
      valueDeclaredUsdB: 47, cargoType: 'Good Delivery silver',
      cargoMix: [{ label: '1000oz bars', sharePct: 82 }, { label: 'Allocated', sharePct: 14 }, { label: 'Grain', sharePct: 4 }],
      partners: [{ country: 'United States', sharePct: 26, direction: 'export' }, { country: 'India', sharePct: 20, direction: 'export' }, { country: 'Switzerland', sharePct: 14, direction: 'export' }, { country: 'Mexico', sharePct: 18, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'newyork_silver', commodityId: 'silver', name: 'New York (COMEX)', country: 'United States',
      lat: 40.71, lng: -74.01, role: 'hub', volume: 12000, volumeUnit: 't/yr',
      valueDeclaredUsdB: 26, cargoType: 'COMEX deliverable silver',
      cargoMix: [{ label: '1000oz bars', sharePct: 88 }, { label: '100oz bars', sharePct: 9 }, { label: 'Grain', sharePct: 3 }],
      partners: [{ country: 'Mexico', sharePct: 34, direction: 'import' }, { country: 'Canada', sharePct: 18, direction: 'import' }, { country: 'United Kingdom', sharePct: 16, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'mumbai_silver', commodityId: 'silver', name: 'Mumbai', country: 'India',
      lat: 19.08, lng: 72.88, role: 'import', volume: 9000, volumeUnit: 't/yr',
      valueDeclaredUsdB: 19, cargoType: 'Silver (industrial & jewellery)',
      cargoMix: [{ label: '1000oz bars', sharePct: 60 }, { label: '30kg bars', sharePct: 30 }, { label: 'Grain', sharePct: 10 }],
      partners: [{ country: 'United Kingdom', sharePct: 30, direction: 'import' }, { country: 'UAE', sharePct: 22, direction: 'import' }, { country: 'China', sharePct: 14, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'shanghai_silver', commodityId: 'silver', name: 'Shanghai (SGE)', country: 'China',
      lat: 31.23, lng: 121.47, role: 'hub', volume: 8000, volumeUnit: 't/yr',
      valueDeclaredUsdB: 17, cargoType: 'Silver (domestic delivery)',
      cargoMix: [{ label: '15kg bars', sharePct: 72 }, { label: 'Grain', sharePct: 20 }, { label: 'Coins', sharePct: 8 }],
      partners: [{ country: 'United Kingdom', sharePct: 24, direction: 'import' }, { country: 'South Korea', sharePct: 16, direction: 'import' }, { country: 'Japan', sharePct: 12, direction: 'import' }],
      year: YEAR,
    },
  ],

  copper: [
    {
      id: 'shanghai_copper', commodityId: 'copper', name: 'Shanghai / Yangshan', country: 'China',
      lat: 30.63, lng: 122.07, role: 'import', volume: 4200, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 38, cargoType: 'Refined cathode & concentrate',
      cargoMix: [{ label: 'Cathode', sharePct: 64 }, { label: 'Concentrate', sharePct: 28 }, { label: 'Scrap', sharePct: 8 }],
      partners: [{ country: 'Chile', sharePct: 32, direction: 'import' }, { country: 'Peru', sharePct: 24, direction: 'import' }, { country: 'DR Congo', sharePct: 16, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'antofagasta_copper', commodityId: 'copper', name: 'Antofagasta', country: 'Chile',
      lat: -23.65, lng: -70.40, role: 'export', volume: 2300, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 21, cargoType: 'Cathode & concentrate',
      cargoMix: [{ label: 'Cathode', sharePct: 52 }, { label: 'Concentrate', sharePct: 48 }],
      partners: [{ country: 'China', sharePct: 46, direction: 'export' }, { country: 'Japan', sharePct: 16, direction: 'export' }, { country: 'South Korea', sharePct: 12, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'callao_copper', commodityId: 'copper', name: 'Callao', country: 'Peru',
      lat: -12.05, lng: -77.14, role: 'export', volume: 1700, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 15, cargoType: 'Copper concentrate',
      cargoMix: [{ label: 'Concentrate', sharePct: 86 }, { label: 'Cathode', sharePct: 14 }],
      partners: [{ country: 'China', sharePct: 54, direction: 'export' }, { country: 'Japan', sharePct: 14, direction: 'export' }, { country: 'Germany', sharePct: 8, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'rotterdam_copper', commodityId: 'copper', name: 'Rotterdam (LME)', country: 'Netherlands',
      lat: 51.95, lng: 4.14, role: 'hub', volume: 900, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 8, cargoType: 'LME warehouse cathode',
      cargoMix: [{ label: 'Grade A cathode', sharePct: 92 }, { label: 'Wire rod', sharePct: 8 }],
      partners: [{ country: 'Germany', sharePct: 30, direction: 'export' }, { country: 'Italy', sharePct: 18, direction: 'export' }, { country: 'Chile', sharePct: 24, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'singapore_copper', commodityId: 'copper', name: 'Singapore (LME)', country: 'Singapore',
      lat: 1.26, lng: 103.84, role: 'hub', volume: 700, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 6, cargoType: 'LME warehouse cathode',
      cargoMix: [{ label: 'Grade A cathode', sharePct: 95 }, { label: 'Scrap', sharePct: 5 }],
      partners: [{ country: 'China', sharePct: 40, direction: 'export' }, { country: 'India', sharePct: 16, direction: 'export' }, { country: 'Chile', sharePct: 22, direction: 'import' }],
      year: YEAR,
    },
  ],

  nickel: [
    {
      id: 'tianjin_nickel', commodityId: 'nickel', name: 'Tianjin', country: 'China',
      lat: 38.98, lng: 117.70, role: 'import', volume: 600, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 10, cargoType: 'Refined nickel & NPI',
      cargoMix: [{ label: 'Class 1 cathode', sharePct: 40 }, { label: 'Nickel pig iron', sharePct: 44 }, { label: 'Sulphate', sharePct: 16 }],
      partners: [{ country: 'Indonesia', sharePct: 48, direction: 'import' }, { country: 'Russia', sharePct: 18, direction: 'import' }, { country: 'Philippines', sharePct: 16, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'pomalaa_nickel', commodityId: 'nickel', name: 'Pomalaa (Sulawesi)', country: 'Indonesia',
      lat: -4.18, lng: 121.61, role: 'export', volume: 520, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 9, cargoType: 'NPI / MHP / matte',
      cargoMix: [{ label: 'Nickel pig iron', sharePct: 56 }, { label: 'MHP', sharePct: 28 }, { label: 'Matte', sharePct: 16 }],
      partners: [{ country: 'China', sharePct: 64, direction: 'export' }, { country: 'South Korea', sharePct: 14, direction: 'export' }, { country: 'Japan', sharePct: 10, direction: 'export' }],
      year: YEAR,
    },
    {
      id: 'singapore_nickel', commodityId: 'nickel', name: 'Singapore (LME)', country: 'Singapore',
      lat: 1.26, lng: 103.84, role: 'hub', volume: 180, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 3, cargoType: 'LME warehouse nickel',
      cargoMix: [{ label: 'Class 1 cathode', sharePct: 70 }, { label: 'Briquettes', sharePct: 24 }, { label: 'Rounds', sharePct: 6 }],
      partners: [{ country: 'China', sharePct: 36, direction: 'export' }, { country: 'India', sharePct: 14, direction: 'export' }, { country: 'Australia', sharePct: 22, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'rotterdam_nickel', commodityId: 'nickel', name: 'Rotterdam (LME)', country: 'Netherlands',
      lat: 51.95, lng: 4.14, role: 'hub', volume: 150, volumeUnit: 'kt/yr',
      valueDeclaredUsdB: 2.6, cargoType: 'LME warehouse nickel',
      cargoMix: [{ label: 'Class 1 cathode', sharePct: 76 }, { label: 'Briquettes', sharePct: 24 }],
      partners: [{ country: 'Germany', sharePct: 28, direction: 'export' }, { country: 'Finland', sharePct: 16, direction: 'export' }, { country: 'Russia', sharePct: 20, direction: 'import' }],
      year: YEAR,
    },
  ],

  palladium: [
    {
      id: 'zurich_pd', commodityId: 'palladium', name: 'Zurich', country: 'Switzerland',
      lat: 47.37, lng: 8.54, role: 'hub', volume: 95, volumeUnit: 't/yr',
      valueDeclaredUsdB: 3.6, cargoType: 'PGM sponge & ingot',
      cargoMix: [{ label: 'Sponge', sharePct: 64 }, { label: 'Ingot', sharePct: 28 }, { label: 'Grain', sharePct: 8 }],
      partners: [{ country: 'United States', sharePct: 30, direction: 'export' }, { country: 'Germany', sharePct: 22, direction: 'export' }, { country: 'South Africa', sharePct: 24, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'london_pd', commodityId: 'palladium', name: 'London (LPPM)', country: 'United Kingdom',
      lat: 51.51, lng: -0.13, role: 'hub', volume: 70, volumeUnit: 't/yr',
      valueDeclaredUsdB: 2.6, cargoType: 'Good Delivery PGM',
      cargoMix: [{ label: 'Ingot', sharePct: 58 }, { label: 'Sponge', sharePct: 34 }, { label: 'Grain', sharePct: 8 }],
      partners: [{ country: 'Switzerland', sharePct: 26, direction: 'export' }, { country: 'United States', sharePct: 20, direction: 'export' }, { country: 'Russia', sharePct: 22, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'newyork_pd', commodityId: 'palladium', name: 'New York (NYMEX)', country: 'United States',
      lat: 40.71, lng: -74.01, role: 'import', volume: 55, volumeUnit: 't/yr',
      valueDeclaredUsdB: 2.1, cargoType: 'NYMEX deliverable PGM',
      cargoMix: [{ label: 'Ingot', sharePct: 70 }, { label: 'Sponge', sharePct: 24 }, { label: 'Plate', sharePct: 6 }],
      partners: [{ country: 'Switzerland', sharePct: 28, direction: 'import' }, { country: 'United Kingdom', sharePct: 18, direction: 'import' }, { country: 'South Africa', sharePct: 20, direction: 'import' }],
      year: YEAR,
    },
    {
      id: 'johannesburg_pd', commodityId: 'palladium', name: 'Johannesburg (OR Tambo)', country: 'South Africa',
      lat: -26.13, lng: 28.24, role: 'export', volume: 74, volumeUnit: 't/yr',
      valueDeclaredUsdB: 2.8, cargoType: 'Refined PGM (export)',
      cargoMix: [{ label: 'Sponge', sharePct: 72 }, { label: 'Ingot', sharePct: 28 }],
      partners: [{ country: 'Switzerland', sharePct: 26, direction: 'export' }, { country: 'United States', sharePct: 22, direction: 'export' }, { country: 'Japan', sharePct: 18, direction: 'export' }],
      year: YEAR,
    },
  ],
};

// Throughput is curated from public port/exchange rankings. The declared-value,
// cargo-mix and trading-partner fields in the seed were MODELED guesses with no
// free source — they are DROPPED here at the adapter boundary so they never reach
// the UI (per PRODUCTION_AUDIT.md). Only the cited throughput is served.
const PORT_SOURCE = {
  source: "Port throughput rankings (Lloyd's List · WSC · EIA/JODI)",
  sourceUrl: 'https://www.worldshipping.org/top-50-ports',
};

export function portActivityFor(commodityId: string): CommodityPortActivity[] {
  return (PORT_ACTIVITY[commodityId] ?? []).map((p) => ({
    id: p.id,
    commodityId: p.commodityId,
    name: p.name,
    country: p.country,
    lat: p.lat,
    lng: p.lng,
    role: p.role,
    volume: p.volume,
    volumeUnit: p.volumeUnit,
    cargoType: p.cargoType,
    year: p.year,
    source: PORT_SOURCE.source,
    sourceUrl: PORT_SOURCE.sourceUrl,
  }));
}
