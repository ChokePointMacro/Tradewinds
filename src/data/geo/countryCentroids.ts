// Approximate country centroids ([lng, lat]) for the producing/trading nations
// that appear in the supply datasets. Used to place production-map bubbles on the
// Route Map. Coarse points for visualization only — not authoritative geography.
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  'United States': [-98, 39],
  Canada: [-106, 56],
  Mexico: [-102, 23],
  Venezuela: [-66, 7],
  Brazil: [-51, -10],
  Chile: [-70, -30],
  Peru: [-75, -10],
  'Saudi Arabia': [45, 24],
  Iraq: [44, 33],
  Iran: [53, 32],
  Russia: [90, 62],
  China: [104, 35],
  India: [79, 22],
  Indonesia: [118, -2],
  Philippines: [122, 12],
  Australia: [134, -25],
  'New Caledonia': [165, -21],
  'South Africa': [25, -29],
  Zimbabwe: [29, -19],
  'DR Congo': [23, -3],
  Poland: [19, 52],
  Japan: [138, 37],
  'South Korea': [128, 36],
  Germany: [10, 51],
  Netherlands: [5.5, 52],
  'United Kingdom': [-2, 54],
  Singapore: [104, 1.3],
  France: [2, 47],
  Italy: [12, 42],
  Spain: [-4, 40],
};

export function getCentroid(country: string): [number, number] | undefined {
  return COUNTRY_CENTROIDS[country];
}
