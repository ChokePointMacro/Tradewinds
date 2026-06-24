import { describe, expect, it } from 'vitest';
import {
  VENTURES,
  CATEGORY_META,
  STAGE_META,
  venturesByCategory,
  disclosedFunding,
} from './innovations';

describe('innovations & ventures tracker', () => {
  it('every venture is well-formed and has at least one funding line + update', () => {
    for (const x of VENTURES) {
      expect(x.id).toBeTruthy();
      expect(x.company).toBeTruthy();
      expect(CATEGORY_META[x.category]).toBeDefined();
      expect(STAGE_META[x.stage]).toBeDefined();
      expect(x.funding.length).toBeGreaterThan(0);
      expect(x.updates.length).toBeGreaterThan(0);
      expect(x.source).toMatch(/ChokepointMacro/);
    }
  });

  it('has unique ids', () => {
    const ids = VENTURES.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('funding kinds are constrained and amounts (when present) are positive', () => {
    const kinds = new Set(['equity', 'debt', 'government', 'offtake', 'grant']);
    for (const x of VENTURES) {
      for (const f of x.funding) {
        expect(kinds.has(f.kind)).toBe(true);
        if (f.amountUsdB !== undefined) expect(f.amountUsdB).toBeGreaterThan(0);
      }
    }
  });

  it('disclosedFunding sums only reported amounts', () => {
    const mp = VENTURES.find((x) => x.id === 'mp_independence')!;
    expect(disclosedFunding(mp)).toBeCloseTo(0.4 + 0.5 + 1.0, 5);
  });

  it('tracks the magnet + HALEU chokepoints (MP magnets, Centrus enrichment)', () => {
    expect(venturesByCategory('magnets').some((x) => x.id === 'mp_independence')).toBe(true);
    expect(venturesByCategory('enrichment').some((x) => x.id === 'centrus')).toBe(true);
  });

  it('update dates are ISO-ish (YYYY-MM or YYYY-MM-DD)', () => {
    for (const x of VENTURES) {
      for (const u of x.updates) {
        expect(u.dateISO).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
      }
    }
  });
});
