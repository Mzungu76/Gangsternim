'use client';
import { useSyncExternalStore } from 'react';
import { clearHistory as clearStored, loadHistory, type HistoryEntry } from './storage';

let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();
const EMPTY: HistoryEntry[] = [];

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Da chiamare quando lo storico viene modificato altrove (es. fine partita). */
export function invalidateHistory() {
  cache = null;
  listeners.forEach((l) => l());
}

export function clearHistory() {
  clearStored();
  invalidateHistory();
}

/** Storico delle partite; `null` durante il rendering lato server. */
export function useHistory(): HistoryEntry[] | null {
  return useSyncExternalStore(
    subscribe,
    () => (cache ??= loadHistory()),
    () => null,
  );
}

export { EMPTY as EMPTY_HISTORY };
