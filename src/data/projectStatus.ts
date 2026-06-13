import type { ProjectStatus } from '@/types';

// Shared project/deployment lifecycle metadata, reused by the Projects and
// Bridge Power tabs (both key off the ProjectStatus enum).

export const STATUS_META: Record<ProjectStatus, { label: string; chip: string }> = {
  announced: { label: 'Announced', chip: 'bg-slate-100 text-slate-600 border-slate-300' },
  permitting: { label: 'Permitting', chip: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_construction: { label: 'Under construction', chip: 'bg-blue-100 text-blue-800 border-blue-300' },
  partially_operational: { label: 'Partially operational', chip: 'bg-teal-100 text-teal-800 border-teal-300' },
  operational: { label: 'Operational', chip: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

// Render order: live first, then build pipeline, then earliest-stage.
export const STATUS_RANK: Record<ProjectStatus, number> = {
  operational: 0,
  partially_operational: 1,
  under_construction: 2,
  permitting: 3,
  announced: 4,
};
