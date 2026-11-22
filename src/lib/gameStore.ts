'use client';
/**
 * Gestione centralizzata dello stato della partita lato interfaccia.
 * Tutte le modifiche passano dal motore puro (applyMove): una mossa non valida
 * non altera lo stato. Ogni cambiamento viene salvato automaticamente.
 */
import { useSyncExternalStore } from 'react';
import type { BotDecision } from '@/game/bot/botEngine';
import { applyMove, createGame } from '@/game/engine';
import type { GameConfig, GameState, Move } from '@/game/types';
import { buildHistoryEntry } from './history';
import { invalidateHistory } from './historyStore';
import { addHistoryEntry, clearSavedGame, isValidGameState, loadGame, saveGame } from './storage';

export interface BotLogEntry {
  turn: number;
  playerName: string;
  decision: Pick<BotDecision, 'move' | 'reason' | 'difficulty' | 'evaluated' | 'ranking'>;
  ms: number;
}

export interface GameStoreState {
  game: GameState | null;
  /** True dopo il primo tentativo di caricare la partita salvata. */
  hydrated: boolean;
  lastError: string | null;
  botLog: BotLogEntry[];
}

let state: GameStoreState = { game: null, hydrated: false, lastError: null, botLog: [] };
const SERVER: GameStoreState = { game: null, hydrated: false, lastError: null, botLog: [] };
const listeners = new Set<() => void>();
const recordedHistory = new Set<string>();

function set(patch: Partial<GameStoreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function persist(game: GameState) {
  if (game.status === 'finished') {
    if (!recordedHistory.has(game.id)) {
      recordedHistory.add(game.id);
      addHistoryEntry(buildHistoryEntry(game));
      invalidateHistory();
    }
    clearSavedGame();
  } else {
    saveGame(game);
  }
}

export const gameStore = {
  getState: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  hydrate() {
    if (state.hydrated) return;
    const saved = loadGame();
    set({ game: state.game ?? saved, hydrated: true });
  },
  start(config: GameConfig): GameState {
    const game = createGame(config);
    persist(game);
    set({ game, hydrated: true, lastError: null, botLog: [] });
    return game;
  },
  /** Carica uno stato arbitrario (modalità test). */
  load(game: GameState): string | null {
    if (!isValidGameState(game)) return 'Stato di gioco non valido.';
    set({ game, hydrated: true, lastError: null, botLog: [] });
    if (game.status === 'playing') saveGame(game);
    return null;
  },
  move(move: Move, opts: { playerId: string; botReason?: string }): boolean {
    if (!state.game) return false;
    const r = applyMove(state.game, move, opts);
    if (!r.ok) {
      set({ lastError: r.error ?? 'Mossa non valida.' });
      return false;
    }
    persist(r.state);
    set({ game: r.state, lastError: null });
    return true;
  },
  logBot(entry: BotLogEntry) {
    set({ botLog: [...state.botLog.slice(-49), entry] });
  },
  clearError() {
    set({ lastError: null });
  },
  abandon() {
    clearSavedGame();
    set({ game: null, botLog: [] });
  },
};

export function useGameStore(): GameStoreState {
  return useSyncExternalStore(gameStore.subscribe, gameStore.getState, () => SERVER);
}
