/**
 * Persistenza su LocalStorage con dati versionati e validati.
 * Ogni voce è salvata come { version, savedAt, data }. Dati corrotti o di
 * versione incompatibile vengono scartati senza bloccare l'applicazione.
 */
import { hasBoss, hasHenchman } from '@/game/catalog';
import { GAME_SCHEMA_VERSION } from '@/game/engine';
import type { BotDifficulty, BotSpeed, GameState, PlayerType } from '@/game/types';

export const STORAGE_KEYS = {
  game: 'gangster-nim:game',
  settings: 'gangster-nim:settings',
  history: 'gangster-nim:history',
  lastSetup: 'gangster-nim:last-setup',
} as const;

export const SETTINGS_VERSION = 1;
export const HISTORY_VERSION = 1;
export const MAX_HISTORY = 200;

export interface Settings {
  botSpeed: BotSpeed;
  showBotReasons: boolean;
  showDebugPanel: boolean;
  animations: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  botSpeed: 'normal',
  showBotReasons: true,
  showDebugPanel: false,
  animations: true,
};

export const BOT_DELAY_MS: Record<BotSpeed, number> = { fast: 500, normal: 1500, slow: 3000 };

export interface HistoryEntry {
  id: string;
  finishedAt: string;
  turns: number;
  gangCount: number;
  players: { name: string; type: PlayerType; difficulty: BotDifficulty | null; total: number; rank: number; bosses: number }[];
  winners: string[];
}

interface Envelope<T> {
  version: number;
  savedAt: string;
  data: T;
}

/** Interfaccia minima di storage (permette i test senza browser). */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStore(): KeyValueStore | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function read<T>(key: string, version: number, store: KeyValueStore | null): T | null {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (!env || typeof env !== 'object' || env.version !== version || env.data === undefined) return null;
    return env.data;
  } catch {
    return null;
  }
}

function write<T>(key: string, version: number, data: T, store: KeyValueStore | null): boolean {
  if (!store) return false;
  try {
    const env: Envelope<T> = { version, savedAt: new Date().toISOString(), data };
    store.setItem(key, JSON.stringify(env));
    return true;
  } catch {
    return false;
  }
}

function remove(key: string, store: KeyValueStore | null) {
  try {
    store?.removeItem(key);
  } catch {
    /* ignora */
  }
}

// --- Validazione partita ----------------------------------------------------

export function isValidGameState(v: unknown): v is GameState {
  if (!v || typeof v !== 'object') return false;
  const s = v as GameState;
  if (s.schemaVersion !== GAME_SCHEMA_VERSION) return false;
  if (!Array.isArray(s.players) || s.players.length < 2 || s.players.length > 4) return false;
  if (!Array.isArray(s.gangs) || s.gangs.length < 1) return false;
  if (!Array.isArray(s.history)) return false;
  if (s.status !== 'playing' && s.status !== 'finished') return false;
  if (!Number.isInteger(s.currentPlayerIndex) || s.currentPlayerIndex < 0 || s.currentPlayerIndex >= s.players.length) return false;
  const seen = new Set<string>();
  for (const g of s.gangs) {
    if (typeof g.id !== 'string' || !hasBoss(g.bossId) || !Array.isArray(g.henchmen)) return false;
    if (g.eliminated !== (g.henchmen.length === 0)) return false;
    for (const c of g.henchmen) {
      if (!hasHenchman(c) || seen.has(c)) return false;
      seen.add(c);
    }
  }
  for (const p of s.players) {
    if (typeof p.id !== 'string' || typeof p.name !== 'string') return false;
    if (p.type !== 'human' && p.type !== 'bot') return false;
    if (!Array.isArray(p.henchmen) || !Array.isArray(p.bosses)) return false;
    for (const c of p.henchmen) {
      if (!hasHenchman(c.cardId) || seen.has(c.cardId) || typeof c.immediateBonus !== 'number') return false;
      seen.add(c.cardId);
    }
    for (const b of p.bosses) if (!hasBoss(b.cardId)) return false;
  }
  return true;
}

// --- API ---------------------------------------------------------------------

export function saveGame(state: GameState, store = defaultStore()): boolean {
  return write(STORAGE_KEYS.game, GAME_SCHEMA_VERSION, state, store);
}

export function loadGame(store = defaultStore()): GameState | null {
  const data = read<GameState>(STORAGE_KEYS.game, GAME_SCHEMA_VERSION, store);
  if (!data) return null;
  if (!isValidGameState(data)) {
    remove(STORAGE_KEYS.game, store);
    return null;
  }
  return data;
}

export function clearSavedGame(store = defaultStore()) {
  remove(STORAGE_KEYS.game, store);
}

export function loadSettings(store = defaultStore()): Settings {
  const s = read<Partial<Settings>>(STORAGE_KEYS.settings, SETTINGS_VERSION, store);
  const merged = { ...DEFAULT_SETTINGS, ...(s ?? {}) };
  if (!['fast', 'normal', 'slow'].includes(merged.botSpeed)) merged.botSpeed = DEFAULT_SETTINGS.botSpeed;
  merged.showBotReasons = Boolean(merged.showBotReasons);
  merged.showDebugPanel = Boolean(merged.showDebugPanel);
  merged.animations = Boolean(merged.animations);
  return merged;
}

export function saveSettings(settings: Settings, store = defaultStore()): boolean {
  return write(STORAGE_KEYS.settings, SETTINGS_VERSION, settings, store);
}

export function loadHistory(store = defaultStore()): HistoryEntry[] {
  const h = read<HistoryEntry[]>(STORAGE_KEYS.history, HISTORY_VERSION, store);
  if (!Array.isArray(h)) return [];
  return h.filter((e) => e && typeof e.id === 'string' && Array.isArray(e.players));
}

export function addHistoryEntry(entry: HistoryEntry, store = defaultStore()): HistoryEntry[] {
  const h = loadHistory(store).filter((e) => e.id !== entry.id);
  const next = [entry, ...h].slice(0, MAX_HISTORY);
  write(STORAGE_KEYS.history, HISTORY_VERSION, next, store);
  return next;
}

export function clearHistory(store = defaultStore()) {
  remove(STORAGE_KEYS.history, store);
}

export function loadLastSetup<T>(store = defaultStore()): T | null {
  return read<T>(STORAGE_KEYS.lastSetup, 1, store);
}

export function saveLastSetup<T>(setup: T, store = defaultStore()) {
  write(STORAGE_KEYS.lastSetup, 1, setup, store);
}

export function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}
