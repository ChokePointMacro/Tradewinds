import type { ProjectStatus } from '@/types';
import { STATUS_META } from '@/data/projectStatus';

// Lifecycle-status pill shared by the Projects and Bridge Power tabs.
export function StatusChip({ status }: { status: ProjectStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${m.chip}`}
    >
      {m.label}
    </span>
  );
}
