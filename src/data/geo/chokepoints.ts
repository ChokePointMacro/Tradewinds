import type { Chokepoint } from '@/types';

// PRD 11.2. Hormuz encoded with limited_pipeline_only bypass — disruption mode
// must surface a warning rather than draw a fake detour (PRD 11.4, DATA-HORMUZ-1).
export const CHOKEPOINTS: Chokepoint[] = [
  { id: 'hormuz', name: 'Strait of Hormuz', lat: 26.57, lng: 56.25, passageKey: 'hormuz', bypass: 'limited_pipeline_only', note: 'No maritime bypass for Gulf crude; only limited pipeline bypass (Saudi East–West, UAE Fujairah).' },
  { id: 'suez', name: 'Suez Canal', lat: 30.42, lng: 32.35, passageKey: 'suez', bypass: 'cape_of_good_hope', note: 'Reroutes around the Cape of Good Hope (+~3,000–3,500 nm Asia–Europe).' },
  { id: 'babelmandeb', name: 'Bab-el-Mandeb', lat: 12.6, lng: 43.4, passageKey: 'bab_el_mandeb', bypass: 'cape_of_good_hope', note: 'Reroutes around the Cape of Good Hope.' },
  { id: 'panama', name: 'Panama Canal', lat: 9.08, lng: -79.68, passageKey: 'panama', bypass: 'magellan_or_us_land', note: 'Reroutes via Magellan / around South America.' },
  { id: 'malacca', name: 'Strait of Malacca', lat: 2.5, lng: 101.5, passageKey: 'malacca', bypass: 'sunda_or_lombok', note: 'Reroutes via Sunda or Lombok strait.' },
  { id: 'goodhope', name: 'Cape of Good Hope', lat: -34.36, lng: 18.47, passageKey: 'cape', note: 'Reroute node (not a closable chokepoint).' },
  { id: 'gibraltar', name: 'Strait of Gibraltar', lat: 35.95, lng: -5.6, passageKey: 'gibraltar', bypass: 'none', note: 'No bypass for Mediterranean access.' },
  { id: 'taiwan', name: 'Taiwan Strait', lat: 24.5, lng: 119.5, passageKey: 'taiwan', bypass: 'east_of_taiwan', note: 'Reroutes east of Taiwan.' },
];

export function getChokepoint(id: string): Chokepoint | undefined {
  return CHOKEPOINTS.find((c) => c.id === id);
}
