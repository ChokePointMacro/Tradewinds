import { useSyncExternalStore } from 'react';
import {
  getDomainSources,
  type SourceDomain,
  type SourceOption,
  type SourceTier,
} from './registry';

// Owner-selected active source + free/paid tier per domain, persisted to
// localStorage. Free-first: when nothing is chosen, a domain resolves to its
// registry default (a free source) at the 'free' tier.

interface DomainState {
  sourceId: string;
  tier: SourceTier;
}
type StoreState = Partial<Record<SourceDomain, DomainState>>;

const KEY = 'tw:active-sources:v1';

function load(): StoreState {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as StoreState) : {};
  } catch {
    return {};
  }
}

let state: StoreState = load();
const listeners = new Set<() => void>();

function persist(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / unavailable */
  }
}

function emit(): void {
  listeners.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot(): StoreState {
  return state;
}

export function setActiveSource(domain: SourceDomain, sourceId: string): void {
  const prev = state[domain];
  state = { ...state, [domain]: { sourceId, tier: prev?.tier ?? 'free' } };
  persist();
  emit();
}

export function setSourceTier(domain: SourceDomain, tier: SourceTier): void {
  const prev = state[domain];
  state = {
    ...state,
    [domain]: { sourceId: prev?.sourceId ?? getDomainSources(domain)?.defaultId ?? '', tier },
  };
  persist();
  emit();
}

export interface ActiveSource {
  sourceId: string;
  tier: SourceTier;
  source?: SourceOption;
  options: SourceOption[];
  setSource: (id: string) => void;
  setTier: (t: SourceTier) => void;
}

export function useActiveSource(domain: SourceDomain): ActiveSource {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const ds = getDomainSources(domain);
  const entry = snap[domain];
  const sourceId = entry?.sourceId ?? ds?.defaultId ?? '';
  const tier = entry?.tier ?? 'free';
  const options = ds?.options ?? [];
  return {
    sourceId,
    tier,
    source: options.find((o) => o.id === sourceId),
    options,
    setSource: (id) => setActiveSource(domain, id),
    setTier: (t) => setSourceTier(domain, t),
  };
}
