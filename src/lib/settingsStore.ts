'use client';
import { useSyncExternalStore } from 'react';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from './storage';

let current: Settings | null = null;
const listeners = new Set<() => void>();

function get(): Settings {
  if (current === null) current = loadSettings();
  return current;
}

export function updateSettings(patch: Partial<Settings>) {
  current = { ...get(), ...patch };
  saveSettings(current);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, get, () => DEFAULT_SETTINGS);
}
