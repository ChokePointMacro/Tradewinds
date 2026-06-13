// Representative major seaport ([lng, lat]) per country (ISO3), used to compute a
// real canal/strait-aware sea route between a country and a trade partner when a
// partner row is clicked on the Route Map. One coarse port per country — a
// visualization aid, not a routing-grade port database. Landlocked nations
// (e.g. Switzerland) are intentionally absent → no maritime route is drawn.
export const COUNTRY_SEAPORTS: Record<string, [number, number]> = {
  USA: [-95.06, 29.75], // Houston
  CAN: [-123.1, 49.29], // Vancouver
  MEX: [-96.13, 19.2], // Veracruz
  BRA: [-46.3, -23.96], // Santos
  COL: [-75.5, 10.4], // Cartagena
  VEN: [-64.8, 10.1], // José
  ECU: [-79.65, 0.98], // Esmeraldas
  PER: [-77.15, -12.05], // Callao
  CHL: [-71.63, -33.04], // Valparaíso
  ARG: [-58.37, -34.6], // Buenos Aires
  GBR: [-1.4, 50.9], // Southampton
  NLD: [4.13, 51.95], // Rotterdam
  BEL: [4.4, 51.25], // Antwerp
  DEU: [9.97, 53.55], // Hamburg
  FRA: [0.1, 49.49], // Le Havre
  ITA: [8.93, 44.4], // Genoa
  ESP: [-5.45, 36.13], // Algeciras
  NOR: [5.32, 60.39], // Bergen
  POL: [18.65, 54.4], // Gdańsk
  SWE: [11.9, 57.7], // Gothenburg
  DNK: [12.6, 55.7], // Copenhagen
  GRC: [23.6, 37.94], // Piraeus
  TUR: [28.7, 40.96], // Ambarlı (Istanbul)
  RUS: [37.8, 44.7], // Novorossiysk
  SAU: [50.16, 26.64], // Ras Tanura
  ARE: [55.06, 25.0], // Jebel Ali
  IRQ: [48.0, 30.0], // Basra
  IRN: [56.28, 27.13], // Bandar Abbas
  KWT: [48.13, 29.08], // Kuwait
  QAT: [51.6, 25.9], // Ras Laffan
  OMN: [56.6, 24.5], // Sohar
  EGY: [29.87, 31.2], // Alexandria
  DZA: [0.32, 35.8], // Arzew
  LBY: [18.4, 30.6], // Es Sider
  NGA: [7.17, 4.45], // Bonny
  AGO: [13.2, -8.8], // Luanda
  GHA: [0.0, 5.6], // Tema
  ZAF: [31.04, -29.87], // Durban
  MAR: [-7.6, 33.6], // Casablanca
  CHN: [121.5, 31.2], // Shanghai
  HKG: [114.15, 22.3], // Hong Kong
  TWN: [120.3, 22.6], // Kaohsiung
  JPN: [139.65, 35.45], // Yokohama
  KOR: [129.04, 35.1], // Busan
  IND: [72.95, 18.95], // Nhava Sheva (Mumbai)
  PAK: [66.97, 24.8], // Karachi
  BGD: [91.8, 22.3], // Chittagong
  LKA: [79.85, 6.95], // Colombo
  SGP: [103.8, 1.27], // Singapore
  MYS: [101.4, 3.0], // Port Klang
  IDN: [106.88, -6.1], // Tanjung Priok (Jakarta)
  THA: [100.9, 13.08], // Laem Chabang
  VNM: [107.0, 10.5], // Cai Mep (HCMC)
  PHL: [120.96, 14.6], // Manila
  AUS: [118.6, -20.3], // Port Hedland
};

export function seaportForIso(iso: string | undefined): [number, number] | undefined {
  return iso ? COUNTRY_SEAPORTS[iso.toUpperCase()] : undefined;
}
