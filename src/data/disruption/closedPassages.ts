import { useSyncExternalStore } from 'react';

// Global "disruption scenario" — the set of chokepoints currently toggled shut,
// shared across the whole app (keyed by chokepoint id). Closing Hormuz in the
// Resilience simulator and on the Route Map is the SAME state, so it drives the
// resilience score, the port-to-port route, and the live trade lanes at once.
const closed = new Set<string>();
let snapshot: string[] = [];
const listeners = new Set<() => void>();

function sync() {
  snapshot = [...closed];
  listeners.forEach((l) => l());
}

export function togglePassage(id: string): void {
  if (closed.has(id)) closed.delete(id);
  else closed.add(id);
  sync();
}

export function clearPassages(): void {
  if (closed.size === 0) return;
  closed.clear();
  sync();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot(): string[] {
  return snapshot;
}

/** Reactive list of closed chokepoint ids. */
export function useClosedPassages(): string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
