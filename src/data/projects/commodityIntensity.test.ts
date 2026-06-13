import { describe, it, expect } from 'vitest';
import type { EnergyProject } from '@/types';
import {
  impliedCommodityDemand,
  COPPER_T_PER_MW,
  SILVER_T_PER_MW,
} from './commodityIntensity';

function project(p: Partial<EnergyProject> & Pick<EnergyProject, 'type'>): EnergyProject {
  return {
    id: 'x',
    name: 'Test',
    developer: 'Dev',
    state: 'Texas',
    status: 'operational',
    note: 'note',
    source: 'src',
    sourceUrl: 'https://example.com',
    ...p,
  };
}

describe('commodity-intensity bridge', () => {
  it('sums copper across generation + data-center types by capacity', () => {
    const projects = [
      project({ id: 'dc', type: 'data_center', capacityMw: 1000 }),
      project({ id: 'nuke', type: 'nuclear', capacityMw: 1000 }),
    ];
    const demand = impliedCommodityDemand(projects);
    const copper = demand.find((d) => d.commodityId === 'copper');
    expect(copper).toBeDefined();
    // 1000*20 + 1000*1.4 = 21,400 t = 21.4 kt
    expect(copper!.tonnes).toBeCloseTo(21_400);
    expect(copper!.displayValue).toBeCloseTo(21.4);
    expect(copper!.unit).toBe('kt');
    expect(copper!.contributingProjects).toBe(2);
    expect(copper!.contributingMw).toBe(2000);
  });

  it('attributes silver to solar only', () => {
    const projects = [
      project({ id: 'pv', type: 'solar', capacityMw: 1000 }),
      project({ id: 'w', type: 'wind', capacityMw: 1000 }),
    ];
    const demand = impliedCommodityDemand(projects);
    const silver = demand.find((d) => d.commodityId === 'silver');
    expect(silver).toBeDefined();
    expect(silver!.tonnes).toBeCloseTo(15); // 1000 * 0.015
    expect(silver!.contributingProjects).toBe(1); // wind excluded
    expect(silver!.contributingMw).toBe(1000);
  });

  it('omits a commodity entirely when no project type drives it', () => {
    const demand = impliedCommodityDemand([project({ type: 'nuclear', capacityMw: 500 })]);
    expect(demand.find((d) => d.commodityId === 'silver')).toBeUndefined();
    expect(demand.find((d) => d.commodityId === 'copper')).toBeDefined();
  });

  it('ignores projects that do not disclose capacity', () => {
    const projects = [
      project({ id: 'a', type: 'data_center', capacityMw: undefined }),
      project({ id: 'b', type: 'data_center', capacityMw: 100 }),
    ];
    const copper = impliedCommodityDemand(projects).find((d) => d.commodityId === 'copper');
    expect(copper!.contributingProjects).toBe(1);
    expect(copper!.tonnes).toBeCloseTo(2000); // 100 * 20
  });

  it('returns an empty list for no usable projects', () => {
    expect(impliedCommodityDemand([])).toEqual([]);
    expect(impliedCommodityDemand([project({ type: 'data_center' })])).toEqual([]);
  });

  it('uses positive, sane intensity factors', () => {
    for (const f of Object.values(COPPER_T_PER_MW)) expect(f).toBeGreaterThan(0);
    for (const f of Object.values(SILVER_T_PER_MW)) expect(f).toBeGreaterThan(0);
    // data centers are the most copper-intensive per MW in our factor set
    expect(COPPER_T_PER_MW.data_center).toBeGreaterThan(COPPER_T_PER_MW.solar!);
  });
});
