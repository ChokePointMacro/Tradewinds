import { describe, expect, it } from 'vitest';
import type { CountryProduction } from '@/types';
import { computeResilienceScore, type ResilienceBand } from './resilienceScore';
import { COUNTRY_RISK } from './countryRisk';

const YEAR = 2024;

function rows(pairs: [string, number][]): CountryProduction[] {
  return pairs.map(([country, amount]) => ({ country, amount, unit: 't/yr', year: YEAR }));
}

// Representative seeds mirroring MockSupplyDataSource so the test exercises the
// real shapes the UI feeds in.
const CRUDE = rows([
  ['United States', 13.2],
  ['Saudi Arabia', 9.7],
  ['Russia', 9.4],
  ['Canada', 4.9],
  ['Iraq', 4.3],
]);
const NICKEL = rows([
  ['Indonesia', 2200],
  ['Philippines', 330],
  ['Russia', 200],
  ['New Caledonia', 190],
  ['Australia', 160],
]);
const GOLD = rows([
  ['China', 370],
  ['Australia', 310],
  ['Russia', 310],
  ['Canada', 200],
  ['United States', 170],
]);

describe('computeResilienceScore', () => {
  it('returns null when there is no production data', () => {
    expect(computeResilienceScore('crude_oil', [])).toBeNull();
    expect(computeResilienceScore('crude_oil', rows([['Nowhere', 0]]))).toBeNull();
  });

  it('produces a 0–100 overall score with three weighted pillars summing to 1', () => {
    const r = computeResilienceScore('crude_oil', CRUDE)!;
    expect(r).not.toBeNull();
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.pillars).toHaveLength(3);
    const totalWeight = r.pillars.reduce((s, p) => s + p.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 5);
  });

  it('overall score equals the weighted mean of pillar scores (within rounding)', () => {
    const r = computeResilienceScore('gold', GOLD)!;
    const weighted = r.pillars.reduce((s, p) => s + p.score * p.weight, 0);
    expect(Math.abs(r.score - weighted)).toBeLessThanOrEqual(1);
  });

  it('computes producer shares that sum to ~100% with a valid HHI', () => {
    const r = computeResilienceScore('nickel', NICKEL)!;
    const shareSum = r.producers.reduce((s, p) => s + p.sharePct, 0);
    expect(shareSum).toBeCloseTo(100, 4);
    // HHI bounds: between fully-even (10000/n) and fully-concentrated (10000).
    expect(r.hhi).toBeGreaterThan(0);
    expect(r.hhi).toBeLessThanOrEqual(10000);
    // Indonesia dominates → HHI well above an even 5-way split (2000).
    expect(r.hhi).toBeGreaterThan(4000);
  });

  it('penalises concentrated supply: nickel concentration < crude concentration', () => {
    const nickel = computeResilienceScore('nickel', NICKEL)!;
    const crude = computeResilienceScore('crude_oil', CRUDE)!;
    const nConc = nickel.pillars.find((p) => p.key === 'concentration')!.score;
    const cConc = crude.pillars.find((p) => p.key === 'concentration')!.score;
    expect(nConc).toBeLessThan(cConc);
  });

  it('rewards routing-light commodities: gold has no maritime chokepoint exposure', () => {
    const gold = computeResilienceScore('gold', GOLD)!;
    expect(gold.chokepoints).toHaveLength(0);
    const choke = gold.pillars.find((p) => p.key === 'chokepoint')!;
    expect(choke.score).toBe(100);
  });

  it('flags Hormuz as a no-bypass passage with latent severity that escalates to a full hit when closed', () => {
    const crude = computeResilienceScore('crude_oil', CRUDE)!;
    const hormuz = crude.chokepoints.find((c) => c.id === 'hormuz');
    expect(hormuz).toBeDefined();
    expect(hormuz!.hasBypass).toBe(false);
    expect(hormuz!.severity).toBe(0.5); // latent (normal ops)
    const closed = computeResilienceScore('crude_oil', CRUDE, ['hormuz'])!;
    expect(closed.chokepoints.find((c) => c.id === 'hormuz')!.severity).toBe(1); // active closure
  });

  it('assigns each producer a country-risk score, defaulting unknown origins', () => {
    const r = computeResilienceScore('crude_oil', CRUDE)!;
    const us = r.producers.find((p) => p.country === 'United States')!;
    expect(us.riskScore).toBe(COUNTRY_RISK['United States']);
    const unknown = computeResilienceScore('x', rows([['Atlantis', 100]]))!;
    expect(unknown.producers[0]!.riskScore).toBe(50);
  });

  it('classifies into a valid resilience band consistent with the score', () => {
    const valid: ResilienceBand[] = ['fragile', 'exposed', 'moderate', 'resilient'];
    for (const seed of [CRUDE, NICKEL, GOLD]) {
      const r = computeResilienceScore('x', seed)!;
      expect(valid).toContain(r.band);
      if (r.score >= 70) expect(r.band).toBe('resilient');
      else if (r.score < 40) expect(r.band).toBe('fragile');
    }
  });

  it('ranks gold as more resilient overall than crude oil', () => {
    const gold = computeResilienceScore('gold', GOLD)!;
    const crude = computeResilienceScore('crude_oil', CRUDE)!;
    expect(gold.score).toBeGreaterThan(crude.score);
  });

  describe('disruption simulator', () => {
    it('no closures leaves the score unchanged and underDisruption false', () => {
      const base = computeResilienceScore('crude_oil', CRUDE)!;
      const sim = computeResilienceScore('crude_oil', CRUDE, [])!;
      expect(sim.score).toBe(base.score);
      expect(sim.underDisruption).toBe(false);
      expect(sim.disruptedFlowPct).toBe(0);
    });

    it('closing a dependent passage lowers the score and flags it closed', () => {
      const base = computeResilienceScore('crude_oil', CRUDE)!;
      const sim = computeResilienceScore('crude_oil', CRUDE, ['hormuz'])!;
      expect(sim.score).toBeLessThan(base.score);
      expect(sim.underDisruption).toBe(true);
      expect(sim.chokepoints.find((c) => c.id === 'hormuz')!.closed).toBe(true);
      expect(sim.disruptedFlowPct).toBeGreaterThan(0);
    });

    it('closing a reroutable passage bites harder than its steady state but less than a no-bypass closure', () => {
      const base = computeResilienceScore('crude_oil', CRUDE)!;
      const reroutable = computeResilienceScore('crude_oil', CRUDE, ['malacca'])!;
      const noBypass = computeResilienceScore('crude_oil', CRUDE, ['hormuz'])!;
      // Malacca closure worsens vs baseline...
      expect(reroutable.score).toBeLessThan(base.score);
      // ...but Hormuz (no bypass) at similar criticality is at least as damaging.
      expect(noBypass.score).toBeLessThanOrEqual(reroutable.score);
    });

    it('ignores closures of passages the commodity does not depend on', () => {
      const base = computeResilienceScore('crude_oil', CRUDE)!;
      const sim = computeResilienceScore('crude_oil', CRUDE, ['panama'])!;
      expect(sim.score).toBe(base.score);
      expect(sim.underDisruption).toBe(false);
    });
  });
});
