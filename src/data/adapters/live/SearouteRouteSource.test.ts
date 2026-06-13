import { describe, it, expect } from 'vitest';
import { SearouteRouteSource } from './SearouteRouteSource';
import type { RouteRequest } from '@/types';

// Reference scenarios (PRD §11.6) as acceptance tests for Tab 1, run against the
// real (deterministic, no-API-key) searoute-ts network. Assertions are bounded
// sanity checks + the special-case behaviours, not brittle exact distances.

const src = new SearouteRouteSource();

function req(overrides: Partial<RouteRequest> & Pick<RouteRequest, 'fromPortId' | 'toPortId'>): RouteRequest {
  return { closedPassages: [], mode: 'sea', vesselType: 'VLCC', ...overrides };
}

describe('PRD §11.6 reference scenarios', () => {
  it('1. Saudi → US Gulf (oil) baseline resolves with sane numbers', async () => {
    const r = await src.getRoute(req({ fromPortId: 'ras_tanura', toPortId: 'houston' }));
    expect(r.distanceNm).toBeGreaterThan(3000);
    expect(Number.isFinite(r.distanceNm)).toBe(true);
    expect(r.transitDays).toBeGreaterThan(0);
    expect(['SOURCED', 'MODELED']).toContain(r.provenance);
    expect(r.constrained).toBeFalsy();
  });

  it('2. Saudi → US, Hormuz closed → warning, no clean reroute', async () => {
    const r = await src.getRoute(
      req({ fromPortId: 'ras_tanura', toPortId: 'houston', closedPassages: ['hormuz'] }),
    );
    expect(r.constrained).toBe(true);
    expect(r.provenance).toBe('MODELED');
    expect(r.passagesUsed).toHaveLength(0);
    expect(r.note?.toLowerCase()).toMatch(/hormuz|bypass/);
  });

  it('3. Saudi → China: closing Suez/Bab-el-Mandeb never shortens the lane', async () => {
    const base = await src.getRoute(req({ fromPortId: 'ras_tanura', toPortId: 'ningbo' }));
    const closed = await src.getRoute(
      req({
        fromPortId: 'ras_tanura',
        toPortId: 'ningbo',
        closedPassages: ['suez', 'bab_el_mandeb'],
      }),
    );
    expect(base.distanceNm).toBeGreaterThan(0);
    expect(closed.distanceNm).toBeGreaterThanOrEqual(base.distanceNm);
  });

  it('3b. Asia → Europe: Suez closed forces a longer Cape-of-Good-Hope reroute', async () => {
    const base = await src.getRoute(req({ fromPortId: 'rotterdam', toPortId: 'shanghai' }));
    const cape = await src.getRoute(
      req({ fromPortId: 'rotterdam', toPortId: 'shanghai', closedPassages: ['suez'] }),
    );
    expect(cape.distanceNm).toBeGreaterThan(base.distanceNm);
  });

  it('4. Trans-Pacific to Long Beach resolves', async () => {
    const r = await src.getRoute(req({ fromPortId: 'shanghai', toPortId: 'long_beach' }));
    expect(r.distanceNm).toBeGreaterThan(3000);
    expect(r.transitDays).toBeGreaterThan(0);
  });

  it('5. Gold air freight (Johannesburg → New York) is MODELED great-circle', async () => {
    const r = await src.getRoute(
      req({ fromPortId: 'johannesburg', toPortId: 'new_york', mode: 'air' }),
    );
    expect(r.provenance).toBe('MODELED');
    expect(r.passagesUsed).toHaveLength(0);
    expect(r.note?.toLowerCase()).toMatch(/air/);
    expect(r.transitDays).toBeGreaterThan(0);
  });

  it('6. Silver sea (Callao → Long Beach) resolves; Panama closure never shortens', async () => {
    const base = await src.getRoute(req({ fromPortId: 'callao', toPortId: 'houston' }));
    const closed = await src.getRoute(
      req({ fromPortId: 'callao', toPortId: 'houston', closedPassages: ['panama'] }),
    );
    expect(base.distanceNm).toBeGreaterThan(0);
    expect(closed.distanceNm).toBeGreaterThanOrEqual(base.distanceNm);
  });
});
