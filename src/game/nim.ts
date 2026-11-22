import { getBoss } from './catalog';
import type { GameState } from './types';

/**
 * Analisi "Nim" del tavolo, usata dal BOT difficile.
 *
 * Modello: chiamiamo "presa sicura" una presa che NON svuota la gang (quindi non
 * fa conquistare il Boss). Su una gang con `n` Scagnozzi e limiti [min, max]
 * le prese sicure sono i k con min ≤ k ≤ max e k < n. Il giocatore che non ha
 * più prese sicure su nessuna gang è costretto a conquistare un Boss.
 *
 * Questo è un gioco di sottrazione in forma normale: ogni gang ha un valore di
 * Grundy g(n) = mex{ g(n-k) } e la somma delle gang si valuta con lo XOR.
 * Con XOR = 0 il giocatore di turno (in una partita a 2) non può evitare, contro
 * un avversario perfetto, di dover essere il primo a prendere un Boss.
 *
 * È un'approssimazione: ignora i punti delle carte, i bonus e la possibilità di
 * prendere volontariamente un Boss; per questo il BOT la usa come uno dei
 * fattori di valutazione, non come strategia assoluta.
 */
const cache = new Map<string, number>();

export function grundy(n: number, min: number, max: number): number {
  const key = `${n}|${min}|${max}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const seen = new Set<number>();
  for (let k = min; k <= max && k < n; k++) seen.add(grundy(n - k, min, max));
  let g = 0;
  while (seen.has(g)) g++;
  cache.set(key, g);
  return g;
}

export function tableNimXor(state: GameState): number {
  let x = 0;
  for (const g of state.gangs) {
    if (g.eliminated || g.henchmen.length === 0) continue;
    const b = getBoss(g.bossId);
    x ^= grundy(g.henchmen.length, b.minTake, b.maxTake);
  }
  return x;
}

/** Numero di gang su cui esiste almeno una presa sicura. */
export function safeGangCount(state: GameState): number {
  let c = 0;
  for (const g of state.gangs) {
    if (g.eliminated) continue;
    const b = getBoss(g.bossId);
    if (g.henchmen.length > b.minTake) c++;
  }
  return c;
}
