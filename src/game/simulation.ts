/**
 * Modalità simulazione: partite composte esclusivamente da BOT, riproducibili
 * tramite seed. Produce statistiche per il bilanciamento; NON modifica il
 * catalogo né le regole.
 */
import { decideMove } from './bot/botEngine';
import { BOSSES, HENCHMEN, getBoss } from './catalog';
import { applyMove, computeRanking, createGame } from './engine';
import { deriveSeed } from './rng';
import type { BotDifficulty, GameState } from './types';

export interface SimulationConfig {
  bots: BotDifficulty[];
  gangCount: number;
  henchmenMin: number;
  henchmenMax: number;
  games: number;
  seed: number;
  /** Ruota il giocatore iniziale a ogni partita per neutralizzare il vantaggio di posizione. */
  rotateStart?: boolean;
  /** Profondità di ricerca del BOT difficile (default automatica). */
  searchDepth?: number;
}

export interface SeatStats {
  seat: number;
  difficulty: BotDifficulty;
  wins: number;
  /** Vittorie pesate: una vittoria ex aequo tra k giocatori vale 1/k. */
  weightedWins: number;
  totalScore: number;
  scores: number[];
  bosses: number;
  malusGross: number;
  malusNet: number;
  bonus: number;
  comboPoints: number;
  combos: Record<string, number>;
}

export interface CardStats {
  id: string;
  name: string;
  dealt: number;
  captured: number;
  /** Partite vinte dal giocatore che possedeva la carta (pesate). */
  ownerWins: number;
}

export interface BossStats {
  id: string;
  name: string;
  dealt: number;
  captured: number;
  /** Partite vinte da chi l'ha conquistato. */
  capturerWins: number;
}

export interface SimulationResult {
  config: SimulationConfig;
  games: number;
  seats: SeatStats[];
  byDifficulty: Record<string, { seats: number; winRate: number; avgScore: number; avgBosses: number; avgMalus: number; avgBonus: number; avgCombo: number }>;
  avgTurns: number;
  ties: number;
  cards: CardStats[];
  bosses: BossStats[];
  durationMs: number;
}

export function createSimulationAccumulator(config: SimulationConfig) {
  const seats: SeatStats[] = config.bots.map((d, i) => ({
    seat: i,
    difficulty: d,
    wins: 0,
    weightedWins: 0,
    totalScore: 0,
    scores: [],
    bosses: 0,
    malusGross: 0,
    malusNet: 0,
    bonus: 0,
    comboPoints: 0,
    combos: {},
  }));
  const cards = new Map<string, CardStats>(HENCHMEN.map((c) => [c.id, { id: c.id, name: c.name + (c.nickname ? ` «${c.nickname}»` : ''), dealt: 0, captured: 0, ownerWins: 0 }]));
  const bosses = new Map<string, BossStats>(BOSSES.map((b) => [b.id, { id: b.id, name: b.name, dealt: 0, captured: 0, capturerWins: 0 }]));
  let turns = 0;
  let ties = 0;
  let played = 0;
  const started = Date.now();

  function playOne(index: number): GameState {
    const n = config.bots.length;
    const startingPlayer = config.rotateStart === false ? 0 : index % n;
    let state = createGame(
      {
        players: config.bots.map((d, i) => ({ name: `BOT ${i + 1}`, type: 'bot', difficulty: d })),
        gangCount: config.gangCount,
        henchmenMin: config.henchmenMin,
        henchmenMax: config.henchmenMax,
        seed: deriveSeed(config.seed, index),
        startingPlayer,
      },
      { id: `sim-${index}`, now: '2000-01-01T00:00:00.000Z' },
    );
    for (const g of state.gangs) {
      bosses.get(g.bossId)!.dealt++;
      for (const c of g.henchmen) cards.get(c)!.dealt++;
    }
    let guard = 0;
    while (state.status === 'playing') {
      if (++guard > 500) throw new Error('Simulazione bloccata: troppi turni.');
      const p = state.players[state.currentPlayerIndex];
      const d = decideMove(state, p.id, p.difficulty!, { searchDepth: config.searchDepth });
      if (!d.move) throw new Error('Un BOT non ha trovato mosse in una partita in corso.');
      const r = applyMove(state, d.move, { playerId: p.id });
      if (!r.ok) throw new Error(`Mossa BOT non valida: ${r.error}`);
      state = r.state;
    }
    record(state);
    return state;
  }

  function record(state: GameState) {
    played++;
    turns += state.history.length;
    const ranking = computeRanking(state);
    const winners = ranking.filter((r) => r.isWinner);
    if (winners.length > 1) ties++;
    for (const r of ranking) {
      const seatIdx = state.players.findIndex((p) => p.id === r.playerId);
      const s = seats[seatIdx];
      const w = r.isWinner ? 1 / winners.length : 0;
      if (r.isWinner) s.wins++;
      s.weightedWins += w;
      s.totalScore += r.score.total;
      s.scores.push(r.score.total);
      s.bosses += r.score.bossCount;
      s.malusGross += r.score.malusGross;
      s.malusNet += r.score.malusNet;
      s.bonus += r.score.individualBonus;
      s.comboPoints += r.score.combo;
      for (const g of r.score.combos.groups) s.combos[g.name] = (s.combos[g.name] ?? 0) + 1;
      const player = state.players[seatIdx];
      for (const c of player.henchmen) {
        const cs = cards.get(c.cardId)!;
        cs.captured++;
        cs.ownerWins += w;
      }
      for (const b of player.bosses) {
        const bs = bosses.get(b.cardId)!;
        bs.captured++;
        bs.capturerWins += w;
      }
    }
  }

  function result(): SimulationResult {
    const byDifficulty: SimulationResult['byDifficulty'] = {};
    for (const d of ['easy', 'medium', 'hard'] as BotDifficulty[]) {
      const ss = seats.filter((s) => s.difficulty === d);
      if (!ss.length) continue;
      const g = played * ss.length;
      byDifficulty[d] = {
        seats: ss.length,
        winRate: ss.reduce((a, s) => a + s.weightedWins, 0) / g,
        avgScore: ss.reduce((a, s) => a + s.totalScore, 0) / g,
        avgBosses: ss.reduce((a, s) => a + s.bosses, 0) / g,
        avgMalus: ss.reduce((a, s) => a + s.malusNet, 0) / g,
        avgBonus: ss.reduce((a, s) => a + s.bonus, 0) / g,
        avgCombo: ss.reduce((a, s) => a + s.comboPoints, 0) / g,
      };
    }
    return {
      config,
      games: played,
      seats,
      byDifficulty,
      avgTurns: played ? turns / played : 0,
      ties,
      cards: [...cards.values()],
      bosses: [...bosses.values()],
      durationMs: Date.now() - started,
    };
  }

  return { playOne, result, get played() { return played; } };
}

/** Esegue l'intera simulazione in modo sincrono (CLI e test). */
export function runSimulation(config: SimulationConfig): SimulationResult {
  const acc = createSimulationAccumulator(config);
  for (let i = 0; i < config.games; i++) acc.playOne(i);
  return acc.result();
}

/** Istogramma dei punteggi a intervalli di `bucket` punti. */
export function scoreHistogram(scores: number[], bucket = 5): { from: number; to: number; count: number }[] {
  if (!scores.length) return [];
  const min = Math.floor(Math.min(...scores) / bucket) * bucket;
  const max = Math.floor(Math.max(...scores) / bucket) * bucket;
  const out: { from: number; to: number; count: number }[] = [];
  for (let f = min; f <= max; f += bucket) out.push({ from: f, to: f + bucket - 1, count: 0 });
  for (const s of scores) out[Math.floor((s - min) / bucket)].count++;
  return out;
}

export function bossLabel(id: string): string {
  return getBoss(id).name;
}
