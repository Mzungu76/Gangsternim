import { BOSSES, HENCHMEN, getBoss, getHenchman } from './catalog';
import { evaluateImmediate } from './effects';
import { cardsForTake, isGangActive, legalTakeCounts } from './gangs';
import { createRng } from './rng';
import { computeAllScores, type ScoreBreakdown } from './scoring';
import { nextPlayerIndex } from './turns';
import type { CapturedHenchman, GameConfig, GameState, GangState, Move, MoveRecord, PlayerState } from './types';

export const GAME_SCHEMA_VERSION = 1;

export const PLAYER_COLORS = ['#b8892b', '#9e2a2b', '#1f6f6b', '#6d4c9a'];

export const LIMITS = {
  minPlayers: 2,
  maxPlayers: 4,
  minGangs: 2,
  maxGangs: 6,
  minHenchmen: 4,
  maxHenchmen: 6,
} as const;

export const DEFAULT_CONFIG: Omit<GameConfig, 'players' | 'seed'> = {
  gangCount: 4,
  henchmenMin: 4,
  henchmenMax: 6,
};

export function validateConfig(config: GameConfig): string[] {
  const e: string[] = [];
  const n = config.players.length;
  if (n < LIMITS.minPlayers || n > LIMITS.maxPlayers) e.push('Servono da 2 a 4 giocatori.');
  if (!Number.isInteger(config.gangCount) || config.gangCount < LIMITS.minGangs || config.gangCount > LIMITS.maxGangs)
    e.push(`Il numero di gang deve essere tra ${LIMITS.minGangs} e ${LIMITS.maxGangs}.`);
  if (config.gangCount > BOSSES.length) e.push('Non ci sono abbastanza Boss nel catalogo.');
  if (
    !Number.isInteger(config.henchmenMin) ||
    !Number.isInteger(config.henchmenMax) ||
    config.henchmenMin < LIMITS.minHenchmen ||
    config.henchmenMax > LIMITS.maxHenchmen ||
    config.henchmenMin > config.henchmenMax
  )
    e.push(`Gli Scagnozzi per gang devono essere tra ${LIMITS.minHenchmen} e ${LIMITS.maxHenchmen}.`);
  if (config.gangCount * config.henchmenMax > HENCHMEN.length) e.push('Non ci sono abbastanza Scagnozzi nel catalogo.');
  config.players.forEach((p, i) => {
    if (!p.name.trim()) e.push(`Il giocatore ${i + 1} non ha un nome.`);
    if (p.type === 'bot' && !p.difficulty) e.push(`Il BOT ${i + 1} non ha un livello di difficoltà.`);
  });
  if (config.startingPlayer !== undefined && (config.startingPlayer < 0 || config.startingPlayer >= n))
    e.push('Giocatore iniziale non valido.');
  return e;
}

/** Crea una nuova partita: Boss e Scagnozzi distinti, distribuiti con seed riproducibile. */
export function createGame(config: GameConfig, opts: { id?: string; now?: string } = {}): GameState {
  const errors = validateConfig(config);
  if (errors.length) throw new Error(errors.join(' '));
  const rng = createRng(config.seed);
  const bosses = rng.shuffle(BOSSES).slice(0, config.gangCount);
  const pool = rng.shuffle(HENCHMEN);
  let cursor = 0;
  const gangs: GangState[] = bosses.map((b, i) => {
    const size = rng.int(config.henchmenMin, config.henchmenMax);
    const henchmen = pool.slice(cursor, cursor + size).map((c) => c.id);
    cursor += size;
    return { id: `gang-${i + 1}`, bossId: b.id, henchmen, initialSize: size, takes: 0, eliminated: false, capturedBy: null };
  });
  const players: PlayerState[] = config.players.map((p, i) => ({
    id: `p${i + 1}`,
    name: p.name.trim(),
    type: p.type,
    difficulty: p.type === 'bot' ? (p.difficulty ?? 'medium') : null,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    henchmen: [],
    bosses: [],
  }));
  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    id: opts.id ?? `game-${config.seed}-${Date.now().toString(36)}`,
    seed: config.seed,
    config: structuredCloneSafe(config),
    players,
    gangs,
    currentPlayerIndex: config.startingPlayer ?? 0,
    turn: 1,
    history: [],
    status: 'playing',
    createdAt: opts.now ?? new Date().toISOString(),
    finishedAt: null,
  };
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export interface LegalMove extends Move {
  /** True se la mossa svuota la gang e fa conquistare il Boss. */
  capturesBoss: boolean;
}

export function listLegalMoves(state: GameState): LegalMove[] {
  if (state.status !== 'playing') return [];
  const out: LegalMove[] = [];
  for (const g of state.gangs) {
    if (!isGangActive(g)) continue;
    for (const count of legalTakeCounts(g)) {
      out.push({ gangId: g.id, count, capturesBoss: count === g.henchmen.length });
    }
  }
  return out;
}

export type MoveValidation = { ok: true } | { ok: false; error: string };

/** Validazione unica, usata da umani e BOT. */
export function validateMove(state: GameState, move: Move, playerId?: string): MoveValidation {
  if (state.status !== 'playing') return { ok: false, error: 'La partita è terminata.' };
  if (playerId !== undefined && state.players[state.currentPlayerIndex]?.id !== playerId)
    return { ok: false, error: 'Non è il tuo turno.' };
  const gang = state.gangs.find((g) => g.id === move.gangId);
  if (!gang) return { ok: false, error: 'Gang inesistente.' };
  if (!isGangActive(gang)) return { ok: false, error: 'Questa gang è già stata eliminata.' };
  if (!Number.isInteger(move.count)) return { ok: false, error: 'Numero di carte non valido.' };
  const legal = legalTakeCounts(gang);
  if (!legal.includes(move.count)) {
    const boss = getBoss(gang.bossId);
    const remaining = gang.henchmen.length;
    if (remaining < boss.minTake)
      return { ok: false, error: `Restano solo ${remaining} carte: devi prenderle tutte.` };
    return {
      ok: false,
      error: `${boss.name} consente prese da ${boss.minTake} a ${Math.min(boss.maxTake, remaining)} carte.`,
    };
  }
  return { ok: true };
}

export interface MoveResult {
  ok: boolean;
  state: GameState;
  error?: string;
  record?: MoveRecord;
}

/**
 * Applica una mossa in modo puro: restituisce un nuovo stato, senza modificare
 * quello ricevuto. Una mossa non valida restituisce lo stato originale invariato.
 */
export function applyMove(state: GameState, move: Move, opts: { playerId?: string; botReason?: string } = {}): MoveResult {
  const v = validateMove(state, move, opts.playerId);
  if (!v.ok) return { ok: false, state, error: v.error };

  const gangIndex = state.gangs.findIndex((g) => g.id === move.gangId);
  const gang = state.gangs[gangIndex];
  const player = state.players[state.currentPlayerIndex];
  const taken = cardsForTake(gang, move.count);
  const remaining = gang.henchmen.slice(0, gang.henchmen.length - move.count);
  const bossCaptured = remaining.length === 0;
  const isFirstTake = gang.takes === 0;

  const captured: CapturedHenchman[] = taken.map((cardId) => {
    const card = getHenchman(cardId);
    return {
      cardId,
      turn: state.turn,
      gangId: gang.id,
      immediateBonus: evaluateImmediate(card, {
        takenCount: move.count,
        bossCaptured,
        isLastHenchman: bossCaptured && cardId === gang.henchmen[0],
        isFirstTake,
      }),
    };
  });

  const newGang: GangState = {
    ...gang,
    henchmen: remaining,
    takes: gang.takes + 1,
    eliminated: bossCaptured,
    capturedBy: bossCaptured ? player.id : null,
  };
  const newPlayer: PlayerState = {
    ...player,
    henchmen: [...player.henchmen, ...captured],
    bosses: bossCaptured ? [...player.bosses, { cardId: gang.bossId, turn: state.turn, gangId: gang.id }] : player.bosses,
  };
  const gangs = state.gangs.map((g, i) => (i === gangIndex ? newGang : g));
  const players = state.players.map((p, i) => (i === state.currentPlayerIndex ? newPlayer : p));
  const record: MoveRecord = {
    turn: state.turn,
    playerId: player.id,
    gangId: gang.id,
    count: move.count,
    cardIds: taken,
    bossCaptured,
    ...(opts.botReason ? { botReason: opts.botReason } : {}),
  };
  const finished = gangs.every((g) => g.eliminated);
  const next: GameState = {
    ...state,
    gangs,
    players,
    history: [...state.history, record],
    turn: state.turn + 1,
    currentPlayerIndex: finished ? state.currentPlayerIndex : nextPlayerIndex(state),
    status: finished ? 'finished' : 'playing',
    finishedAt: finished ? new Date().toISOString() : null,
  };
  return { ok: true, state: next, record };
}

export interface RankingEntry {
  playerId: string;
  name: string;
  rank: number;
  score: ScoreBreakdown;
  isWinner: boolean;
}

/**
 * Classifica: punteggio totale decrescente. In caso di parità prevale chi ha il
 * malus netto più basso; se la parità persiste, la posizione è condivisa
 * (vittoria ex aequo).
 */
export function computeRanking(state: GameState): RankingEntry[] {
  const scores = computeAllScores(state.players);
  const entries = state.players.map((p, i) => ({ p, s: scores[i], i }));
  entries.sort((a, b) => b.s.total - a.s.total || a.s.malusNet - b.s.malusNet || a.i - b.i);
  const out: RankingEntry[] = [];
  entries.forEach((e, idx) => {
    const prev = idx > 0 ? entries[idx - 1] : null;
    const tied = prev && prev.s.total === e.s.total && prev.s.malusNet === e.s.malusNet;
    const rank = tied ? out[idx - 1].rank : idx + 1;
    out.push({ playerId: e.p.id, name: e.p.name, rank, score: e.s, isWinner: rank === 1 });
  });
  return out;
}

export function remainingHenchmen(state: GameState): number {
  return state.gangs.reduce((s, g) => s + g.henchmen.length, 0);
}
