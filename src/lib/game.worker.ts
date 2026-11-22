/// <reference lib="webworker" />
/**
 * Web Worker per i calcoli pesanti (decisioni dei BOT e simulazioni), così
 * l'interfaccia resta sempre reattiva. Usa lo stesso motore puro della UI.
 */
import { decideMove } from '@/game/bot/botEngine';
import { createSimulationAccumulator, type SimulationConfig } from '@/game/simulation';
import type { BotDifficulty, GameState } from '@/game/types';

export type WorkerRequest =
  | { kind: 'decide'; id: number; state: GameState; playerId: string; difficulty: BotDifficulty }
  | { kind: 'simulate'; id: number; config: SimulationConfig }
  | { kind: 'stop'; id: number };

const stopped = new Set<number>();

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  if (msg.kind === 'stop') {
    stopped.add(msg.id);
    return;
  }
  if (msg.kind === 'decide') {
    try {
      const t0 = performance.now();
      const decision = decideMove(msg.state, msg.playerId, msg.difficulty);
      self.postMessage({ kind: 'decision', id: msg.id, decision, ms: Math.round(performance.now() - t0) });
    } catch (err) {
      self.postMessage({ kind: 'error', id: msg.id, error: String(err) });
    }
    return;
  }
  if (msg.kind === 'simulate') {
    try {
      const acc = createSimulationAccumulator(msg.config);
      let last = 0;
      for (let i = 0; i < msg.config.games; i++) {
        if (stopped.has(msg.id)) break;
        acc.playOne(i);
        const now = performance.now();
        if (now - last > 100) {
          last = now;
          self.postMessage({ kind: 'progress', id: msg.id, done: i + 1 });
        }
      }
      self.postMessage({ kind: 'result', id: msg.id, result: acc.result() });
    } catch (err) {
      self.postMessage({ kind: 'error', id: msg.id, error: String(err) });
    }
  }
};
