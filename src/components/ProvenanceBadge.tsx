import type { Provenance } from '@/types';

// Hard product requirement (PRD §0.5): every displayed number carries a visible
// SOURCED (with source) or MODELED badge.
export function ProvenanceBadge({ provenance, source }: { provenance: Provenance; source?: string }) {
  const isSourced = provenance === 'SOURCED';
  const cls = isSourced
    ? 'bg-teal-100 text-teal-800 border-teal-300'
    : 'bg-amber-100 text-amber-800 border-amber-300';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}
      title={isSourced && source ? `Source: ${source}` : 'Modeled / estimated value'}
    >
      {provenance}
      {isSourced && source ? <span className="font-normal normal-case opacity-80">· {source}</span> : null}
    </span>
  );
}
