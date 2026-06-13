import type { Provenance } from '@/types';

// Country sourcing-risk index (0–100, higher = riskier origin) derived from the
// World Bank Worldwide Governance Indicators: risk = 100 − the mean of the six
// WGI governance scores (Voice & Accountability, Political Stability, Government
// Effectiveness, Regulatory Quality, Rule of Law, Control of Corruption; each
// 0–100). SOURCED — generated from api.worldbank.org (GOV_WGI_*.SC). Unlisted
// origins fall back to a neutral 50.
export const COUNTRY_RISK_YEAR = 2024;
export const COUNTRY_RISK_PROVENANCE: Provenance = 'SOURCED';
export const COUNTRY_RISK_SOURCE = 'World Bank WGI 2024';
export const COUNTRY_RISK_SOURCE_URL =
  'https://www.worldbank.org/en/publication/worldwide-governance-indicators';

export const COUNTRY_RISK: Record<string, number> = {
  "Norway": 14,
  "Switzerland": 14,
  "Australia": 17,
  "Netherlands": 17,
  "Canada": 19,
  "Japan": 19,
  "Germany": 20,
  "United Kingdom": 23,
  "Belgium": 24,
  "South Korea": 27,
  "United States": 28,
  "France": 28,
  "Chile": 30,
  "New Caledonia": 30,
  "Spain": 31,
  "Poland": 32,
  "Italy": 32,
  "United Arab Emirates": 32,
  "Qatar": 34,
  "Saudi Arabia": 41,
  "Kuwait": 42,
  "Argentina": 46,
  "South Africa": 46,
  "India": 47,
  "China": 48,
  "Indonesia": 48,
  "Kazakhstan": 48,
  "Brazil": 49,
  "Peru": 50,
  "Philippines": 51,
  "Mexico": 55,
  "Turkey": 55,
  "Egypt": 58,
  "Russia": 61,
  "Nigeria": 64,
  "Zimbabwe": 65,
  "Iraq": 67,
  "Iran": 67,
  "DR Congo": 73,
  "Venezuela": 76,
};

export const DEFAULT_COUNTRY_RISK = 50;

export function countryRisk(country: string): number {
  return COUNTRY_RISK[country] ?? DEFAULT_COUNTRY_RISK;
}
