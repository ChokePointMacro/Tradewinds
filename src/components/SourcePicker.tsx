import type { SourceDomain, SourceStatus } from '@/data/sources/registry';
import { useActiveSource } from '@/data/sources/sourceStore';

const STATUS_TAG: Record<SourceStatus, string> = {
  live: 'Connected',
  planned: 'Coming soon',
  'needs-key': 'Needs your key',
};

// Free⇄paid toggle + a dropdown of the real sources for a data domain. Only
// 'live' sources are selectable; 'planned' (free, not yet wired) and 'needs-key'
// (paid / requires a key) options are shown but disabled — opt-in, never auto.
export function SourcePicker({ domain }: { domain: SourceDomain }) {
  const { sourceId, tier, options, setSource, setTier } = useActiveSource(domain);
  const filtered = options.filter((o) => o.tier === tier);
  const selectable = filtered.some((o) => o.id === sourceId && o.status === 'live');

  return (
    <div className="space-y-1.5">
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-[11px] font-medium">
        {(['free', 'paid'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTier(t)}
            className={`rounded px-2 py-0.5 capitalize transition ${
              t === tier ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <select
        value={selectable ? sourceId : ''}
        onChange={(e) => setSource(e.target.value)}
        aria-label={`${tier} data source`}
        className="block w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
      >
        <option value="" disabled>
          Select a {tier} source…
        </option>
        {filtered.map((o) => (
          <option key={o.id} value={o.id} disabled={o.status !== 'live'}>
            {o.name}
            {o.status !== 'live' ? ` · ${STATUS_TAG[o.status]}` : ''}
          </option>
        ))}
      </select>
      {filtered.length === 0 && (
        <p className="text-[11px] text-slate-400">No {tier} sources catalogued for this data yet.</p>
      )}
    </div>
  );
}
