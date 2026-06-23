import { describe, expect, it } from 'vitest';
import { baseCriticality, criticalityCurve, CRITICALITY_YEARS } from './criticality';

describe('dynamic criticality (Recommendation 4)', () => {
  it('returns null with no midstream anchor', () => {
    expect(baseCriticality('gold')).toBeNull();
    expect(criticalityCurve('gold')).toBeNull();
  });

  it('scores export-controlled monopolies as severe (gallium, NdPr)', () => {
    expect(baseCriticality('gallium')!).toBeGreaterThanOrEqual(80);
    expect(baseCriticality('neodymium')!).toBeGreaterThanOrEqual(80);
  });

  it('emits a point per modelled year', () => {
    const c = criticalityCurve('lithium')!;
    expect(c.curve.map((p) => p.year)).toEqual([...CRITICALITY_YEARS]);
  });

  it('bends DOWN over time where substitution levers exist (lithium, cobalt)', () => {
    for (const id of ['lithium', 'cobalt', 'graphite']) {
      const c = criticalityCurve(id)!;
      expect(c.end).toBeLessThan(c.base);
      // monotonically non-increasing
      for (let i = 1; i < c.curve.length; i++) {
        expect(c.curve[i]!.criticality).toBeLessThanOrEqual(c.curve[i - 1]!.criticality);
      }
    }
  });

  it('cobalt erodes faster than tungsten (chemistry design-out vs low substitutability)', () => {
    const cobalt = criticalityCurve('cobalt')!;
    const tungsten = criticalityCurve('tungsten')!;
    const cobaltDrop = cobalt.base - cobalt.end;
    const tungstenDrop = tungsten.base - tungsten.end;
    expect(cobaltDrop).toBeGreaterThan(tungstenDrop);
  });

  it('models uranium criticality easing as HALEU enrichment scales', () => {
    const u = criticalityCurve('uranium')!;
    expect(u.modifiers.some((m) => /HALEU|enrichment/i.test(m.driver))).toBe(true);
    expect(u.end).toBeLessThan(u.base);
  });
});
