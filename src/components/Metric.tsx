import type { ReactNode } from 'react';

// A labelled metric block (label over value), shared by detail cards.
export function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
