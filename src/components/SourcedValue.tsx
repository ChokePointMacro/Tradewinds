import type { ReactNode } from 'react';
import { ProvenanceBadge } from '@/components/ProvenanceBadge';
import { SourcePicker } from '@/components/SourcePicker';
import type { SourceDomain } from '@/data/sources/registry';

export type SourcedStatus = 'loading' | 'live' | 'unavailable';

// The production-posture wrapper for any displayed datum. Renders the value with
// a SOURCED badge + "as of" when a source is live; a skeleton while loading; and
// an inline "No source" panel with a free⇄paid source-picker when nothing
// provides it. Makes rendering an unsourced number structurally impossible.
export function SourcedValue({
  status,
  domain,
  source,
  asOfISO,
  reason,
  children,
}: {
  status: SourcedStatus;
  domain: SourceDomain;
  source?: string;
  asOfISO?: string;
  reason?: string;
  children?: ReactNode;
}) {
  if (status === 'loading') {
    return <div className="h-8 w-28 animate-pulse rounded bg-slate-100" aria-busy="true" />;
  }

  if (status === 'live') {
    return (
      <div>
        {children}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <ProvenanceBadge provenance="SOURCED" source={source} />
          {asOfISO && (
            <span className="text-[11px] text-slate-400">
              as of {new Date(asOfISO).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-2.5">
      <div className="flex items-start gap-1.5">
        <span className="shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          No source
        </span>
        <span className="text-xs text-slate-600">
          {reason ?? 'No connected source provides this value.'}
        </span>
      </div>
      <div className="mt-2">
        <SourcePicker domain={domain} />
      </div>
    </div>
  );
}
