import { getBoss } from './catalog';
import type { BossCard, GangState } from './types';

/**
 * Quantità di carte prelevabili da una gang, secondo i limiti permanenti del Boss.
 * - Si preleva sempre dall'estremità destra, consecutivamente.
 * - Se restano meno carte del minimo, bisogna prenderle tutte.
 * - Il Boss non si preleva mai direttamente: arriva con l'ultimo Scagnozzo.
 */
export function legalTakeCountsFor(remaining: number, boss: Pick<BossCard, 'minTake' | 'maxTake'>): number[] {
  if (remaining <= 0) return [];
  if (remaining < boss.minTake) return [remaining];
  const out: number[] = [];
  for (let k = boss.minTake; k <= Math.min(boss.maxTake, remaining); k++) out.push(k);
  return out;
}

export function legalTakeCounts(gang: GangState): number[] {
  if (gang.eliminated) return [];
  return legalTakeCountsFor(gang.henchmen.length, getBoss(gang.bossId));
}

/** Carte che verrebbero prelevate (dalla destra) per una presa di `count` carte. */
export function cardsForTake(gang: GangState, count: number): string[] {
  return gang.henchmen.slice(gang.henchmen.length - count);
}

export function isGangActive(gang: GangState): boolean {
  return !gang.eliminated && gang.henchmen.length > 0;
}
