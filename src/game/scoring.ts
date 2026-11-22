import { getBoss, getHenchman } from './catalog';
import { computeCombos, emptySpecRecord, type ComboResult } from './combos';
import { describeEffect, effectTiming, evaluateConditional, type CollectionContext } from './effects';
import type { PlayerState, Specialization } from './types';

export type ScoreCategory = 'base' | 'immediate' | 'conditional' | 'permanent' | 'combo' | 'malus';

export interface ScoreLine {
  category: ScoreCategory;
  /** ID della carta che genera la voce (null per le combo). */
  cardId: string | null;
  label: string;
  points: number;
}

export interface BossMalusDetail {
  bossId: string;
  malus: number;
  reduction: number;
  /** ID delle carte che hanno ridotto il malus. */
  reducedBy: string[];
}

export interface ScoreBreakdown {
  playerId: string;
  base: number;
  immediate: number;
  conditional: number;
  combo: number;
  /** Somma dei malus dei Boss conquistati (valore positivo). */
  malusGross: number;
  /** Riduzione complessiva ottenuta dai bonus permanenti (valore positivo). */
  malusReduction: number;
  /** Malus effettivo (valore positivo) = malusGross - malusReduction. */
  malusNet: number;
  /** Bonus individuali = immediati + condizionati. */
  individualBonus: number;
  total: number;
  henchmenCount: number;
  bossCount: number;
  lines: ScoreLine[];
  combos: ComboResult;
  bosses: BossMalusDetail[];
}

export function specCountsOf(player: PlayerState): Record<Specialization, number> {
  const r = emptySpecRecord();
  for (const c of player.henchmen) r[getHenchman(c.cardId).specialization]++;
  return r;
}

/**
 * Calcolo completo e deterministico del punteggio di un giocatore.
 * Tutto viene ricalcolato dallo stato: i bonus immediati sono quelli registrati
 * al momento della conquista; condizionati, combo e riduzioni dei malus sono
 * ricalcolati ogni volta → nessun effetto può essere contato due volte.
 */
export function computeScore(player: PlayerState, allPlayers: readonly PlayerState[]): ScoreBreakdown {
  const lines: ScoreLine[] = [];
  const cards = player.henchmen.map((c) => ({ rec: c, card: getHenchman(c.cardId) }));
  const specCounts = emptySpecRecord();
  const comboCounts = emptySpecRecord();
  let wildcards = 0;
  for (const { card } of cards) {
    specCounts[card.specialization]++;
    if (card.effect.type === 'comboWildcard') wildcards++;
    else comboCounts[card.specialization]++;
  }

  // Punteggio base
  let base = 0;
  for (const { card } of cards) base += card.basePoints;

  // Bonus immediati registrati alla conquista
  let immediate = 0;
  for (const { rec, card } of cards) {
    if (rec.immediateBonus !== 0) {
      immediate += rec.immediateBonus;
      lines.push({ category: 'immediate', cardId: card.id, label: describeEffect(card).text, points: rec.immediateBonus });
    }
  }

  // Combo
  const combos = computeCombos(comboCounts, wildcards);
  for (const g of combos.groups) {
    lines.push({ category: 'combo', cardId: null, label: `${g.name} di ${g.specialization}`, points: g.points });
  }

  // Bonus condizionati
  const ctx: CollectionContext = {
    specCounts,
    henchmenCount: cards.length,
    bossCount: player.bosses.length,
    opponentSpecCounts: allPlayers.filter((p) => p.id !== player.id).map(specCountsOf),
    comboMaxSize: combos.maxSizeBySpec,
  };
  let conditional = 0;
  for (const { card } of cards) {
    if (effectTiming(card.effect) !== 'conditional') continue;
    const v = evaluateConditional(card, ctx);
    if (v !== 0) {
      conditional += v;
      lines.push({ category: 'conditional', cardId: card.id, label: describeEffect(card).text, points: v });
    }
  }

  // Malus dei Boss e riduzioni permanenti.
  // Ogni carta di riduzione si applica a un Boss diverso; abbinamento ordinato
  // (riduzione maggiore → malus maggiore), che massimizza la riduzione totale.
  const bossDetails: BossMalusDetail[] = player.bosses
    .map((b) => ({ bossId: b.cardId, malus: getBoss(b.cardId).malus, reduction: 0, reducedBy: [] as string[] }))
    .sort((a, b) => b.malus - a.malus || a.bossId.localeCompare(b.bossId));
  const reducers = cards
    .filter(({ card }) => card.effect.type === 'malusReduction')
    .map(({ card }) => ({ id: card.id, amount: card.effect.type === 'malusReduction' ? card.effect.amount : 0 }))
    .sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id));
  for (let i = 0; i < reducers.length && i < bossDetails.length; i++) {
    const d = bossDetails[i];
    const r = Math.min(reducers[i].amount, d.malus - d.reduction);
    if (r > 0) {
      d.reduction += r;
      d.reducedBy.push(reducers[i].id);
      lines.push({ category: 'permanent', cardId: reducers[i].id, label: `Riduce il malus di ${getBoss(d.bossId).name}`, points: r });
    }
  }
  const malusGross = bossDetails.reduce((s, d) => s + d.malus, 0);
  const malusReduction = bossDetails.reduce((s, d) => s + d.reduction, 0);
  for (const d of bossDetails) {
    lines.push({ category: 'malus', cardId: d.bossId, label: `Malus ${getBoss(d.bossId).name}`, points: -d.malus });
  }
  const malusNet = malusGross - malusReduction;

  const total = base + immediate + conditional + combos.points - malusNet;
  return {
    playerId: player.id,
    base,
    immediate,
    conditional,
    combo: combos.points,
    malusGross,
    malusReduction,
    malusNet,
    individualBonus: immediate + conditional,
    total,
    henchmenCount: cards.length,
    bossCount: player.bosses.length,
    lines,
    combos,
    bosses: bossDetails,
  };
}

export function computeAllScores(players: readonly PlayerState[]): ScoreBreakdown[] {
  return players.map((p) => computeScore(p, players));
}
