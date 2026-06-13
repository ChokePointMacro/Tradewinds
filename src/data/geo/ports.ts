import type { Port } from '@/types';

// Major world ports (PRD §11.2). Coordinates are approximate harbour/terminal
// positions (flagged DATA-GEO-1) — searoute snaps each to the nearest shipping
// lane, so sub-degree error is fine. Most large ports handle both directions, so
// they carry role ['export','import']; dedicated crude-export terminals and
// consuming refinery ports are tagged accordingly. Air nodes (mode ['air']) are
// bullion freight hubs used for gold/silver air routing.
const BOTH: ('export' | 'import')[] = ['export', 'import'];

export const PORTS: Port[] = [
  // ── East & Southeast Asia ───────────────────────────────────────────────
  { id: 'shanghai', name: 'Shanghai', country: 'China', lat: 31.23, lng: 121.49, role: BOTH, mode: ['sea'] },
  { id: 'ningbo', name: 'Ningbo-Zhoushan', country: 'China', lat: 29.87, lng: 121.55, role: BOTH, mode: ['sea'] },
  { id: 'shenzhen', name: 'Shenzhen (Yantian)', country: 'China', lat: 22.56, lng: 114.27, role: BOTH, mode: ['sea'] },
  { id: 'qingdao', name: 'Qingdao', country: 'China', lat: 36.07, lng: 120.32, role: BOTH, mode: ['sea'] },
  { id: 'tianjin', name: 'Tianjin', country: 'China', lat: 38.98, lng: 117.78, role: BOTH, mode: ['sea'] },
  { id: 'dalian', name: 'Dalian', country: 'China', lat: 38.93, lng: 121.63, role: BOTH, mode: ['sea'] },
  { id: 'hong_kong', name: 'Hong Kong', country: 'Hong Kong', lat: 22.30, lng: 114.13, role: BOTH, mode: ['sea'] },
  { id: 'kaohsiung', name: 'Kaohsiung', country: 'Taiwan', lat: 22.61, lng: 120.28, role: BOTH, mode: ['sea'] },
  { id: 'busan', name: 'Busan', country: 'South Korea', lat: 35.10, lng: 129.04, role: BOTH, mode: ['sea'] },
  { id: 'ulsan', name: 'Ulsan', country: 'South Korea', lat: 35.50, lng: 129.38, role: BOTH, mode: ['sea'] },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.26, lng: 103.83, role: BOTH, mode: ['sea'] },
  { id: 'port_klang', name: 'Port Klang', country: 'Malaysia', lat: 3.00, lng: 101.39, role: BOTH, mode: ['sea'] },
  { id: 'tanjung_pelepas', name: 'Tanjung Pelepas', country: 'Malaysia', lat: 1.36, lng: 103.55, role: BOTH, mode: ['sea'] },
  { id: 'laem_chabang', name: 'Laem Chabang', country: 'Thailand', lat: 13.08, lng: 100.88, role: BOTH, mode: ['sea'] },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.62, lng: 139.78, role: BOTH, mode: ['sea'] },
  { id: 'chiba', name: 'Chiba', country: 'Japan', lat: 35.57, lng: 140.05, role: BOTH, mode: ['sea'] },
  { id: 'nhava_sheva', name: 'Nhava Sheva (Mumbai)', country: 'India', lat: 18.95, lng: 72.95, role: BOTH, mode: ['sea'] },
  { id: 'sikka', name: 'Sikka / Jamnagar', country: 'India', lat: 22.43, lng: 69.84, role: BOTH, mode: ['sea'] },
  { id: 'colombo', name: 'Colombo', country: 'Sri Lanka', lat: 6.94, lng: 79.84, role: BOTH, mode: ['sea'] },

  // ── Persian Gulf & Middle East (Hormuz-exposed unless noted) ────────────
  { id: 'ras_tanura', name: 'Ras Tanura', country: 'Saudi Arabia', lat: 26.64, lng: 50.16, role: BOTH, mode: ['sea'] },
  { id: 'jubail', name: 'Jubail', country: 'Saudi Arabia', lat: 27.02, lng: 49.66, role: BOTH, mode: ['sea'] },
  { id: 'basra', name: 'Basra / Al Faw', country: 'Iraq', lat: 29.98, lng: 48.80, role: BOTH, mode: ['sea'] },
  { id: 'kharg_island', name: 'Kharg Island', country: 'Iran', lat: 29.23, lng: 50.32, role: BOTH, mode: ['sea'] },
  { id: 'bandar_abbas', name: 'Bandar Abbas', country: 'Iran', lat: 27.13, lng: 56.21, role: BOTH, mode: ['sea'] },
  { id: 'jebel_ali', name: 'Jebel Ali (Dubai)', country: 'UAE', lat: 25.01, lng: 55.06, role: BOTH, mode: ['sea'] },
  { id: 'ruwais', name: 'Ruwais', country: 'UAE', lat: 24.14, lng: 52.73, role: BOTH, mode: ['sea'] },
  { id: 'ras_laffan', name: 'Ras Laffan', country: 'Qatar', lat: 25.92, lng: 51.57, role: BOTH, mode: ['sea'] },
  { id: 'kuwait', name: 'Shuwaikh / Kuwait', country: 'Kuwait', lat: 29.35, lng: 47.93, role: BOTH, mode: ['sea'] },
  { id: 'fujairah', name: 'Fujairah (outside Hormuz)', country: 'UAE', lat: 25.16, lng: 56.36, role: BOTH, mode: ['sea'] },
  { id: 'sohar', name: 'Sohar (outside Hormuz)', country: 'Oman', lat: 24.51, lng: 56.63, role: BOTH, mode: ['sea'] },
  { id: 'yanbu', name: 'Yanbu (Red Sea)', country: 'Saudi Arabia', lat: 24.09, lng: 38.06, role: BOTH, mode: ['sea'] },

  // ── Europe ──────────────────────────────────────────────────────────────
  { id: 'rotterdam', name: 'Rotterdam', country: 'Netherlands', lat: 51.95, lng: 4.14, role: BOTH, mode: ['sea'] },
  { id: 'antwerp', name: 'Antwerp', country: 'Belgium', lat: 51.26, lng: 4.40, role: BOTH, mode: ['sea'] },
  { id: 'hamburg', name: 'Hamburg', country: 'Germany', lat: 53.54, lng: 9.93, role: BOTH, mode: ['sea'] },
  { id: 'le_havre', name: 'Le Havre', country: 'France', lat: 49.48, lng: 0.12, role: BOTH, mode: ['sea'] },
  { id: 'marseille', name: 'Marseille / Fos', country: 'France', lat: 43.40, lng: 4.88, role: BOTH, mode: ['sea'] },
  { id: 'algeciras', name: 'Algeciras', country: 'Spain', lat: 36.13, lng: -5.44, role: BOTH, mode: ['sea'] },
  { id: 'valencia', name: 'Valencia', country: 'Spain', lat: 39.44, lng: -0.32, role: BOTH, mode: ['sea'] },
  { id: 'piraeus', name: 'Piraeus', country: 'Greece', lat: 37.94, lng: 23.63, role: BOTH, mode: ['sea'] },
  { id: 'trieste', name: 'Trieste', country: 'Italy', lat: 45.64, lng: 13.76, role: BOTH, mode: ['sea'] },

  // ── Russia & Black Sea (crude export) ───────────────────────────────────
  { id: 'primorsk', name: 'Primorsk', country: 'Russia', lat: 60.34, lng: 28.61, role: BOTH, mode: ['sea'] },
  { id: 'ust_luga', name: 'Ust-Luga', country: 'Russia', lat: 59.67, lng: 28.40, role: BOTH, mode: ['sea'] },
  { id: 'novorossiysk', name: 'Novorossiysk', country: 'Russia', lat: 44.72, lng: 37.79, role: BOTH, mode: ['sea'] },

  // ── Africa ──────────────────────────────────────────────────────────────
  { id: 'tanger_med', name: 'Tanger Med', country: 'Morocco', lat: 35.88, lng: -5.50, role: BOTH, mode: ['sea'] },
  { id: 'port_said', name: 'Port Said', country: 'Egypt', lat: 31.25, lng: 32.30, role: BOTH, mode: ['sea'] },
  { id: 'bonny', name: 'Bonny Island', country: 'Nigeria', lat: 4.42, lng: 7.16, role: BOTH, mode: ['sea'] },
  { id: 'lagos', name: 'Lagos (Apapa)', country: 'Nigeria', lat: 6.45, lng: 3.37, role: BOTH, mode: ['sea'] },
  { id: 'luanda', name: 'Luanda', country: 'Angola', lat: -8.78, lng: 13.24, role: BOTH, mode: ['sea'] },
  { id: 'durban', name: 'Durban', country: 'South Africa', lat: -29.87, lng: 31.03, role: BOTH, mode: ['sea'] },

  // ── Americas ────────────────────────────────────────────────────────────
  { id: 'houston', name: 'Houston', country: 'USA', lat: 29.73, lng: -95.27, role: BOTH, mode: ['sea'] },
  { id: 'corpus_christi', name: 'Corpus Christi', country: 'USA', lat: 27.80, lng: -97.40, role: BOTH, mode: ['sea'] },
  { id: 'new_orleans', name: 'New Orleans (LOOP)', country: 'USA', lat: 28.88, lng: -90.02, role: BOTH, mode: ['sea'] },
  { id: 'new_york_nj', name: 'New York / New Jersey', country: 'USA', lat: 40.66, lng: -74.04, role: BOTH, mode: ['sea'] },
  { id: 'savannah', name: 'Savannah', country: 'USA', lat: 32.08, lng: -81.10, role: BOTH, mode: ['sea'] },
  { id: 'long_beach', name: 'Long Beach', country: 'USA', lat: 33.75, lng: -118.20, role: BOTH, mode: ['sea'] },
  { id: 'los_angeles', name: 'Los Angeles', country: 'USA', lat: 33.73, lng: -118.26, role: BOTH, mode: ['sea'] },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', lat: 49.29, lng: -123.11, role: BOTH, mode: ['sea'] },
  { id: 'manzanillo', name: 'Manzanillo', country: 'Mexico', lat: 19.05, lng: -104.31, role: BOTH, mode: ['sea'] },
  { id: 'santos', name: 'Santos', country: 'Brazil', lat: -23.96, lng: -46.30, role: BOTH, mode: ['sea'] },
  { id: 'callao', name: 'Lima / Callao', country: 'Peru', lat: -12.05, lng: -77.14, role: BOTH, mode: ['sea'] },
  { id: 'buenos_aires', name: 'Buenos Aires', country: 'Argentina', lat: -34.60, lng: -58.37, role: BOTH, mode: ['sea'] },

  // ── Oceania ─────────────────────────────────────────────────────────────
  { id: 'port_hedland', name: 'Port Hedland', country: 'Australia', lat: -20.31, lng: 118.58, role: BOTH, mode: ['sea'] },
  { id: 'melbourne', name: 'Melbourne', country: 'Australia', lat: -37.83, lng: 144.92, role: BOTH, mode: ['sea'] },

  // ── Bullion air-freight hubs (gold/silver air mode) ─────────────────────
  { id: 'zurich', name: 'Zurich (ZRH)', country: 'Switzerland', lat: 47.46, lng: 8.55, role: BOTH, mode: ['air'] },
  { id: 'london_air', name: 'London (LHR)', country: 'United Kingdom', lat: 51.47, lng: -0.45, role: BOTH, mode: ['air'] },
  { id: 'frankfurt_air', name: 'Frankfurt (FRA)', country: 'Germany', lat: 50.04, lng: 8.56, role: BOTH, mode: ['air'] },
  { id: 'dubai_air', name: 'Dubai (DXB)', country: 'UAE', lat: 25.25, lng: 55.36, role: BOTH, mode: ['air'] },
  { id: 'hong_kong_air', name: 'Hong Kong (HKG)', country: 'Hong Kong', lat: 22.31, lng: 113.91, role: BOTH, mode: ['air'] },
  { id: 'singapore_air', name: 'Singapore (SIN)', country: 'Singapore', lat: 1.36, lng: 103.99, role: BOTH, mode: ['air'] },
  { id: 'new_york', name: 'New York (JFK)', country: 'USA', lat: 40.64, lng: -73.78, role: BOTH, mode: ['air'] },
  { id: 'johannesburg', name: 'Johannesburg (OR Tambo)', country: 'South Africa', lat: -26.13, lng: 28.24, role: BOTH, mode: ['air'] },
];

export function getPort(id: string): Port | undefined {
  return PORTS.find((p) => p.id === id);
}
