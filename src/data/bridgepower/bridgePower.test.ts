import { describe, it, expect } from 'vitest';
import { BRIDGE_POWER, bridgePowerByType, allBridgePower } from './bridgePower';

const TYPES = ['mobile_gas_turbine', 'gas_turbine', 'gas_engine', 'fuel_cell', 'diesel_genset'] as const;
const STATUSES = [
  'announced',
  'permitting',
  'under_construction',
  'partially_operational',
  'operational',
] as const;

describe('bridge-power seed data', () => {
  it('has a non-trivial number of deployments', () => {
    expect(BRIDGE_POWER.length).toBeGreaterThanOrEqual(8);
  });

  it('uses unique ids', () => {
    const ids = BRIDGE_POWER.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('spans the headline power types', () => {
    expect(bridgePowerByType('mobile_gas_turbine').length).toBeGreaterThan(0);
    expect(bridgePowerByType('fuel_cell').length).toBeGreaterThan(0);
    expect(bridgePowerByType('gas_turbine').length).toBeGreaterThan(0);
  });

  it('uses valid type and status enums', () => {
    for (const d of BRIDGE_POWER) {
      expect(TYPES).toContain(d.type);
      expect(STATUSES).toContain(d.status);
    }
  });

  it('every deployment carries a verifiable source URL and note', () => {
    for (const d of BRIDGE_POWER) {
      expect(d.source.length, `${d.id} source`).toBeGreaterThan(0);
      expect(d.sourceUrl, `${d.id} url`).toMatch(/^https:\/\//);
      expect(d.note.length, `${d.id} note`).toBeGreaterThan(0);
    }
  });

  it('uses positive capacity and investment when present', () => {
    for (const d of BRIDGE_POWER) {
      if (d.capacityMw !== undefined) {
        expect(d.capacityMw, `${d.id} capacity`).toBeGreaterThan(0);
      }
      if (d.investmentUsdB !== undefined) {
        expect(d.investmentUsdB, `${d.id} investment`).toBeGreaterThan(0);
      }
    }
  });

  it('uses sane years (2022+) and ordered timelines', () => {
    for (const d of BRIDGE_POWER) {
      for (const y of [d.announcedYear, d.onlineYear]) {
        if (y !== undefined) {
          expect(y, `${d.id} year`).toBeGreaterThanOrEqual(2022);
          expect(y).toBeLessThanOrEqual(2040);
        }
      }
      if (d.announcedYear !== undefined && d.onlineYear !== undefined) {
        expect(d.onlineYear, `${d.id} timeline`).toBeGreaterThanOrEqual(d.announcedYear);
      }
    }
  });

  it('includes at least one genuine bridge and labels bridge as a boolean', () => {
    expect(BRIDGE_POWER.some((d) => d.bridge)).toBe(true);
    for (const d of BRIDGE_POWER) expect(typeof d.bridge).toBe('boolean');
  });

  it('allBridgePower returns the full set', () => {
    expect(allBridgePower()).toHaveLength(BRIDGE_POWER.length);
  });
});
