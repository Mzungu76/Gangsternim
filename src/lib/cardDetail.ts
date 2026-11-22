'use client';
import { useSyncExternalStore } from 'react';
import type { Card } from '@/game/types';

let current: Card | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function openCardDetail(card: Card) {
  current = card;
  emit();
}

export function closeCardDetail() {
  current = null;
  emit();
}

export function useCardDetail(): Card | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
