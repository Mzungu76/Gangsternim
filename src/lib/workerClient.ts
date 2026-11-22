'use client';
import { decideMove, type BotDecision } from '@/game/bot/botEngine';
import type { SimulationConfig, SimulationResult } from '@/game/simulation';
import type { BotDifficulty, GameState } from '@/game/types';

let worker: Worker | null = null;
let failed = false;
let seq = 0;
const handlers = new Map<number, (data: { kind: string; [k: string]: unknown }) => void>();

function getWorker(): Worker | null {
  if (failed || typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (!worker) {
    try {
      worker = new Worker(new URL('./game.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => handlers.get(e.data.id)?.(e.data);
      worker.onerror = () => {
        failed = true;
        worker = null;
      };
    } catch {
      failed = true;
      return null;
    }
  }
  return worker;
}

/** Decisione del BOT in un Web Worker (fallback sincrono se i worker non sono disponibili). */
export function decideInWorker(state: GameState, playerId: string, difficulty: BotDifficulty): Promise<{ decision: BotDecision; ms: number }> {
  const w = getWorker();
  if (!w) {
    const t0 = performance.now();
    return Promise.resolve({ decision: decideMove(state, playerId, difficulty), ms: Math.round(performance.now() - t0) });
  }
  const id = ++seq;
  return new Promise((resolve, reject) => {
    handlers.set(id, (d) => {
      handlers.delete(id);
      if (d.kind === 'decision') resolve({ decision: d.decision as BotDecision, ms: d.ms as number });
      else reject(new Error(String(d.error)));
    });
    w.postMessage({ kind: 'decide', id, state, playerId, difficulty });
  });
}

export interface SimulationJob {
  promise: Promise<SimulationResult>;
  stop: () => void;
}

/** Simulazione in un Web Worker con avanzamento. Restituisce null se i worker non sono disponibili. */
export function simulateInWorker(config: SimulationConfig, onProgress: (done: number) => void): SimulationJob | null {
  const w = getWorker();
  if (!w) return null;
  const id = ++seq;
  const promise = new Promise<SimulationResult>((resolve, reject) => {
    handlers.set(id, (d) => {
      if (d.kind === 'progress') onProgress(d.done as number);
      else {
        handlers.delete(id);
        if (d.kind === 'result') resolve(d.result as SimulationResult);
        else reject(new Error(String(d.error)));
      }
    });
    w.postMessage({ kind: 'simulate', id, config });
  });
  return { promise, stop: () => w.postMessage({ kind: 'stop', id }) };
}
