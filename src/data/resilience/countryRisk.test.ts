import { describe, expect, it } from 'vitest';
import {
  COUNTRY_RISK,
  COUNTRY_RISK_PROVENANCE,
  COUNTRY_RISK_SOURCE,
  countryRisk,
  DEFAULT_COUNTRY_RISK,
} from './countryRisk';

describe('country-risk (World Bank WGI)', () => {
  it('is SOURCED with a named source', () => {
    expect(COUNTRY_RISK_PROVENANCE).toBe('SOURCED');
    expect(COUNTRY_RISK_SOURCE).toMatch(/WGI/);
  });

  it('every value is an integer risk in [0, 100]', () => {
    for (const [country, v] of Object.entries(COUNTRY_RISK)) {
      expect(Number.isInteger(v), `${country}`).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('covers the major producing nations', () => {
    for (const c of ['United States', 'China', 'Russia', 'Saudi Arabia', 'Australia', 'DR Congo']) {
      expect(COUNTRY_RISK[c]).toBeDefined();
    }
  });

  it('ranks stable democracies below high-risk states (sanity)', () => {
    expect(COUNTRY_RISK['Norway']!).toBeLessThan(COUNTRY_RISK['Russia']!);
    expect(COUNTRY_RISK['Australia']!).toBeLessThan(COUNTRY_RISK['Venezuela']!);
    expect(COUNTRY_RISK['Canada']!).toBeLessThan(COUNTRY_RISK['Iraq']!);
  });

  it('falls back to a neutral default for unlisted origins', () => {
    expect(countryRisk('Atlantis')).toBe(DEFAULT_COUNTRY_RISK);
    expect(DEFAULT_COUNTRY_RISK).toBe(50);
  });
});
