/**
 * botEngine.ts — motore decisionale dei BOT di GANGSTER NIM.
 *
 * Riceve lo stato pubblico della partita (tutte le carte sono scoperte: non
 * esistono informazioni nascoste) e restituisce gang, numero di carte e
 * motivazione. Non modifica mai lo stato: simula le mosse con le stesse funzioni
 * pure (`listLegalMoves`, `applyMove`, `validateMove`) usate per i giocatori umani.
 */
import { getBoss, getHenchman } from '../catalog';
import { SPECIALIZATION_INFO } from '../data/specializations';
import { applyMove, listLegalMoves, validateMove, type LegalMove } from '../engine';
import { tableNimXor } from '../nim';
import { createRng, deriveSeed, type Rng } from '../rng';
import { computeAllScores, computeScore, type ScoreBreakdown } from '../scoring';
import type { BotDifficulty, GameState, Move, PlayerState } from '../types';

export interface MoveFactors {
  move: Move;
  /** Variazione del punteggio totale del BOT (combo, bonus e malus inclusi). */
  gain: number;
  /** Variazione considerando solo punti base e bonus immediati. */
  simpleGain: number;
  capturesBoss: boolean;
  bossName: string;
  bossMalus: number;
  /** Combo completate con la mossa (es. "una Coppia di Scassinatori"). */
  combosCompleted: string[];
  /** Miglior guadagno disponibile al giocatore successivo dopo la mossa. */
  nextPlayerBestGain: number;
  /** Combo che un avversario avrebbe potuto completare con le carte sottratte. */
  blockedCombos: { playerName: string; combo: string }[];
  /** XOR del gioco delle "prese sicure" dopo la mossa (solo BOT difficile). */
  nimXorAfter: number | null;
  /** Valore assegnato dalla valutazione del livello di difficoltà. */
  value: number;
}

export interface BotDecision {
  move: Move | null;
  reason: string;
  difficulty: BotDifficulty;
  /** Numero di mosse legali analizzate al primo livello. */
  evaluated: number;
  factors: MoveFactors | null;
  /** Classifica delle mosse candidate (per il pannello di debug). */
  ranking: { move: Move; value: number }[];
}

export interface BotOptions {
  /** Seed per le scelte casuali controllate (riproducibilità). */
  seed?: number;
  /** Profondità della ricerca del BOT difficile (plies dopo la propria mossa, 1-4). */
  searchDepth?: number;
}

const COMBO_ARTICLE: Record<number, string> = { 2: 'una', 3: 'un', 4: 'un' };

// ---------------------------------------------------------------------------
// Analisi comune
// ---------------------------------------------------------------------------

function totalOf(state: GameState, playerId: string): number {
  const p = state.players.find((x) => x.id === playerId)!;
  return computeScore(p, state.players).total;
}

function simpleValueOf(state: GameState, playerId: string): number {
  const p = state.players.find((x) => x.id === playerId)!;
  let v = 0;
  for (const c of p.henchmen) v += getHenchman(c.cardId).basePoints + c.immediateBonus;
  for (const b of p.bosses) v -= getBoss(b.cardId).malus;
  return v;
}

function comboKeys(score: ScoreBreakdown): string[] {
  return score.combos.groups.map((g) => `${g.specialization}|${g.size}|${g.name}`);
}

function newCombos(before: ScoreBreakdown, after: ScoreBreakdown): string[] {
  const prev = comboKeys(before);
  const out: string[] = [];
  for (const k of comboKeys(after)) {
    const i = prev.indexOf(k);
    if (i >= 0) prev.splice(i, 1);
    else {
      const [spec, size, name] = k.split('|');
      const info = SPECIALIZATION_INFO[spec as keyof typeof SPECIALIZATION_INFO];
      out.push(`${COMBO_ARTICLE[Number(size)] ?? 'una'} ${name} di ${info.plural}`);
    }
  }
  return out;
}

/** Miglior guadagno immediato (punteggio completo) disponibile al giocatore di turno. */
function bestImmediateGain(state: GameState): number {
  if (state.status !== 'playing') return 0;
  const mover = state.players[state.currentPlayerIndex];
  const before = totalOf(state, mover.id);
  let best = -Infinity;
  for (const m of listLegalMoves(state)) {
    const r = applyMove(state, m);
    if (!r.ok) continue;
    best = Math.max(best, totalOf(r.state, mover.id) - before);
  }
  return best === -Infinity ? 0 : best;
}

/** Combo che gli avversari avrebbero potuto completare con le carte prelevate. */
function blockedCombos(state: GameState, me: PlayerState, cardIds: string[]): { playerName: string; combo: string }[] {
  const out: { playerName: string; combo: string }[] = [];
  const takenSpecs = new Map<string, number>();
  for (const id of cardIds) {
    const s = getHenchman(id).specialization;
    takenSpecs.set(s, (takenSpecs.get(s) ?? 0) + 1);
  }
  for (const opp of state.players) {
    if (opp.id === me.id) continue;
    const sc = computeScore(opp, state.players);
    for (const pr of sc.combos.progress) {
      const avail = takenSpecs.get(pr.specialization) ?? 0;
      if (pr.missingForNext !== null && avail >= pr.missingForNext && pr.nextComboName) {
        out.push({
          playerName: opp.name,
          combo: `${pr.nextComboName.toLowerCase() === 'tris' ? 'un' : pr.nextComboName.toLowerCase() === 'quartetto' ? 'un' : 'una'} ${pr.nextComboName} di ${SPECIALIZATION_INFO[pr.specialization].plural}`,
        });
      }
    }
  }
  return out;
}

function analyse(state: GameState, me: PlayerState, move: LegalMove, withNim: boolean): { factors: MoveFactors; next: GameState } {
  const r = applyMove(state, move);
  if (!r.ok) throw new Error(`Mossa non valida generata dal BOT: ${r.error}`);
  const next = r.state;
  const before = computeScore(me, state.players);
  const meAfter = next.players.find((p) => p.id === me.id)!;
  const after = computeScore(meAfter, next.players);
  const gang = state.gangs.find((g) => g.id === move.gangId)!;
  const boss = getBoss(gang.bossId);
  return {
    next,
    factors: {
      move: { gangId: move.gangId, count: move.count },
      gain: after.total - before.total,
      simpleGain: simpleValueOf(next, me.id) - simpleValueOf(state, me.id),
      capturesBoss: move.capturesBoss,
      bossName: boss.name,
      bossMalus: boss.malus,
      combosCompleted: newCombos(before, after),
      nextPlayerBestGain: bestImmediateGain(next),
      blockedCombos: blockedCombos(state, me, r.record!.cardIds),
      nimXorAfter: withNim && next.status === 'playing' ? tableNimXor(next) : null,
      value: 0,
    },
  };
}

// ---------------------------------------------------------------------------
// BOT FACILE
// ---------------------------------------------------------------------------

function easyValue(f: MoveFactors): number {
  // Guarda soprattutto ai punti immediati; i bonus "complessi" contano solo a metà.
  let v = f.simpleGain + 0.5 * (f.gain - f.simpleGain);
  // Evita i Boss molto penalizzanti, sottovaluta quelli leggeri (errore da principiante).
  if (f.capturesBoss) v += f.bossMalus >= 5 ? -0.5 * f.bossMalus : 0.6 * f.bossMalus;
  return v;
}

// ---------------------------------------------------------------------------
// BOT MEDIO
// ---------------------------------------------------------------------------

function mediumValue(state: GameState, me: PlayerState, f: MoveFactors, next: GameState): number {
  let v = f.gain;
  // Spinta a completare le combo: avvicinarsi di una carta vale qualcosa.
  const meAfter = next.players.find((p) => p.id === me.id)!;
  const sc = computeScore(meAfter, next.players);
  for (const pr of sc.combos.progress) if (pr.missingForNext === 1) v += 0.5;
  // Valore lasciato sul tavolo per il giocatore successivo.
  v -= 0.6 * Math.max(0, f.nextPlayerBestGain);
  // Carte sottratte agli avversari che le avrebbero usate per una combo.
  v += 0.8 * f.blockedCombos.length;
  // Dimensioni delle gang: lasciare una gang "avvelenata" (meno del minimo) non è un problema
  // per noi, ma lasciarne una prendibile per intero con malus basso aiuta il successivo.
  const gang = next.gangs.find((g) => g.id === f.move.gangId)!;
  if (!gang.eliminated) {
    const boss = getBoss(gang.bossId);
    if (gang.henchmen.length < boss.minTake) v += 0.3;
  }
  void state;
  return v;
}

// ---------------------------------------------------------------------------
// BOT DIFFICILE — ricerca ad albero max-n con modello avversario
// ---------------------------------------------------------------------------

/** Pesi della valutazione del BOT difficile (modificabili per esperimenti di bilanciamento). */
export const HARD_TUNING = {
  /** Peso del miglior avversario rispetto alla media degli avversari. */
  maxOtherWeight: 0.65,
  /** Peso del fattore Nim a 2 giocatori e con più giocatori. */
  nimWeight2p: 0.5,
  nimWeightNp: 0.2,
  /** Valore di una combo a una carta dal completamento. */
  nearComboValue: 0.5,
  /** Ampiezza del beam nei nodi propri. */
  beam: 6,
  /** Peso del "tempo": il giocatore di turno a fine ricerca incasserà circa il suo miglior guadagno. */
  tempoWeight: 0.7,
  /** Sotto questa soglia di carte residue si tenta il calcolo esatto del finale. */
  endgameCards: 10,
  /** Budget massimo di nodi per il calcolo esatto del finale. */
  endgameBudget: 30000,
};

interface SearchCtx {
  me: string;
  nodes: number;
}

function relativeEval(state: GameState, me: string, withTempo = false): number {
  const scores = computeAllScores(state.players);
  const idx = state.players.findIndex((p) => p.id === me);
  const mine = scores[idx].total;
  const others = scores.filter((_, i) => i !== idx).map((s) => s.total);
  const maxOther = Math.max(...others);
  const meanOther = others.reduce((a, b) => a + b, 0) / others.length;

  if (state.status === 'finished') {
    // Terminale: conta soprattutto vincere.
    const margin = mine - maxOther;
    if (margin > 0) return 1000 + margin;
    if (margin === 0) return 400;
    return -1000 + margin;
  }

  const pot = scores.map((sc) => sc.combos.progress.filter((p) => p.missingForNext === 1).length * HARD_TUNING.nearComboValue);
  const potOthers = pot.filter((_, i) => i !== idx);
  let v =
    mine + pot[idx] -
    (HARD_TUNING.maxOtherWeight * Math.max(...others.map((o, i) => o + potOthers[i])) +
      (1 - HARD_TUNING.maxOtherWeight) * (meanOther + potOthers.reduce((a, b) => a + b, 0) / potOthers.length));

  // Fattore Nim (prese sicure): con XOR = 0 il giocatore di turno rischia di essere
  // costretto a prendere un Boss. Peso pieno a 2 giocatori, ridotto con più giocatori.
  const active = state.gangs.filter((g) => !g.eliminated);
  if (active.length > 0) {
    const avgMalus = active.reduce((s, g) => s + getBoss(g.bossId).malus, 0) / active.length;
    const xor = tableNimXor(state);
    const toMoveIsMe = state.players[state.currentPlayerIndex].id === me;
    const w = state.players.length === 2 ? HARD_TUNING.nimWeight2p : HARD_TUNING.nimWeightNp;
    const sign = xor === 0 ? -1 : 1;
    v += (toMoveIsMe ? sign : -sign) * w * avgMalus;
  }
  if (withTempo && HARD_TUNING.tempoWeight > 0) {
    const toMoveIsMe = state.players[state.currentPlayerIndex].id === me;
    const g = Math.max(0, bestImmediateGain(state));
    v += (toMoveIsMe ? 1 : -1) * HARD_TUNING.tempoWeight * g;
  }
  return v;
}

/** Mossa prevista per un avversario: massimizza il proprio vantaggio immediato relativo. */
function opponentReply(state: GameState): LegalMove | null {
  const moves = listLegalMoves(state);
  if (moves.length === 0) return null;
  const mover = state.players[state.currentPlayerIndex].id;
  let best = moves[0];
  let bestV = -Infinity;
  for (const m of moves) {
    const r = applyMove(state, m);
    if (!r.ok) continue;
    const v = relativeEval(r.state, mover);
    if (v > bestV) {
      bestV = v;
      best = m;
    }
  }
  return best;
}

function search(state: GameState, depth: number, ctx: SearchCtx): number {
  ctx.nodes++;
  if (state.status === 'finished' || depth === 0) return relativeEval(state, ctx.me, true);
  const mover = state.players[state.currentPlayerIndex].id;
  if (mover !== ctx.me) {
    const reply = opponentReply(state);
    if (!reply) return relativeEval(state, ctx.me);
    const r = applyMove(state, reply);
    return search(r.state, depth - 1, ctx);
  }
  // Nostro turno: massimizza, esplorando le mosse più promettenti (beam).
  const moves = listLegalMoves(state);
  const scored = moves
    .map((m) => {
      const r = applyMove(state, m);
      return { r: r.state, v: relativeEval(r.state, ctx.me) };
    })
    .sort((a, b) => b.v - a.v)
    .slice(0, HARD_TUNING.beam);
  let best = -Infinity;
  for (const s of scored) best = Math.max(best, search(s.r, depth - 1, ctx));
  return best;
}

/**
 * Finale esatto (max-n): quando restano poche carte ogni giocatore sceglie la
 * mossa che massimizza la propria utilità finale (vittoria + margine). Il
 * risultato è un vettore di utilità, una per giocatore. Interrotto se supera il
 * budget di nodi (in tal caso si usa la ricerca euristica).
 */
class BudgetExceeded extends Error {}

function terminalUtilities(state: GameState): number[] {
  const scores = computeAllScores(state.players).map((s) => s.total);
  return scores.map((mine, i) => {
    const others = scores.filter((_, j) => j !== i);
    const margin = mine - Math.max(...others);
    return margin > 0 ? 1000 + margin : margin === 0 ? 400 : -1000 + margin;
  });
}

function maxn(state: GameState, budget: { nodes: number }): number[] {
  if (--budget.nodes < 0) throw new BudgetExceeded();
  if (state.status === 'finished') return terminalUtilities(state);
  const idx = state.currentPlayerIndex;
  let best: number[] | null = null;
  for (const m of listLegalMoves(state)) {
    const u = maxn(applyMove(state, m).state, budget);
    if (!best || u[idx] > best[idx]) best = u;
  }
  return best ?? terminalUtilities(state);
}

export function defaultSearchDepth(state: GameState): number {
  const n = state.players.length;
  const remaining = state.gangs.reduce((s, g) => s + g.henchmen.length, 0);
  const base = n === 2 ? 2 : n - 1;
  return Math.min(4, remaining <= 8 ? base + 1 : base);
}

// ---------------------------------------------------------------------------
// Motivazioni (prodotte dai fattori realmente valutati)
// ---------------------------------------------------------------------------

function explain(
  difficulty: BotDifficulty,
  f: MoveFactors,
  all: MoveFactors[],
  extra: { random?: boolean; depth?: number; evaluated: number; forced: boolean; endgame?: boolean },
): string {
  const parts: string[] = [];
  const takeTxt = `${f.move.count} ${f.move.count === 1 ? 'carta' : 'carte'} dalla gang di ${f.bossName}`;

  if (extra.random) return `Ho seguito l'istinto e preso ${takeTxt}, senza pensarci troppo.`;

  if (extra.forced && f.capturesBoss) {
    parts.push(`Non avevo alternative: ogni mossa disponibile mi faceva conquistare un Boss, ho scelto ${f.bossName} (malus -${f.bossMalus}).`);
  } else {
    parts.push(`Ho preso ${takeTxt} (${f.gain >= 0 ? '+' : ''}${f.gain} punti).`);
  }

  if (f.combosCompleted.length) parts.push(`Ho scelto questa gang per completare ${f.combosCompleted.join(' e ')}.`);

  if (!extra.forced) {
    if (f.capturesBoss) {
      parts.push(`Ho accettato il Boss perché il malus di ${f.bossMalus} è compensato dalle carte.`);
    } else {
      const bossAlternatives = all.filter((a) => a.capturesBoss && a.gain > f.gain - 1);
      const avoided = bossAlternatives.sort((a, b) => b.bossMalus - a.bossMalus)[0];
      if (avoided && avoided.bossMalus >= 3) {
        parts.push(`Ho evitato ${avoided.bossName} perché il suo malus (-${avoided.bossMalus}) è troppo elevato.`);
      }
    }
  }

  if (difficulty !== 'easy') {
    if (f.blockedCombos.length) {
      const b = f.blockedCombos[0];
      parts.push(`Ho sottratto queste carte per impedire a ${b.playerName} di completare ${b.combo}.`);
    }
    const bestNext = Math.min(...all.map((a) => a.nextPlayerBestGain));
    if (f.nextPlayerBestGain === bestNext && all.length > 1 && f.nextPlayerBestGain < Math.max(...all.map((a) => a.nextPlayerBestGain))) {
      parts.push(`Così il prossimo giocatore può guadagnare al massimo ${f.nextPlayerBestGain} punti.`);
    }
  }

  if (difficulty === 'hard') {
    if (f.nimXorAfter === 0) parts.push('Lascio il tavolo in posizione Nim sfavorevole (XOR delle prese sicure = 0) per chi gioca dopo.');
    if (extra.endgame) parts.push(`Ho calcolato il finale fino all'ultima carta: questa è la mossa migliore per le mie probabilità di vittoria, supponendo che ognuno giochi al meglio.`);
    else parts.push(`Ho analizzato ${extra.evaluated} mosse con una ricerca a ${extra.depth} livelli.`);
  }
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// API pubblica
// ---------------------------------------------------------------------------

export function decideMove(
  state: GameState,
  playerId: string,
  difficulty: BotDifficulty,
  options: BotOptions = {},
): BotDecision {
  const empty: BotDecision = { move: null, reason: 'Nessuna mossa disponibile.', difficulty, evaluated: 0, factors: null, ranking: [] };
  if (state.status !== 'playing') return { ...empty, reason: 'La partita è terminata.' };
  const me = state.players[state.currentPlayerIndex];
  if (!me || me.id !== playerId) return { ...empty, reason: 'Non è il turno di questo BOT.' };
  const moves = listLegalMoves(state);
  if (moves.length === 0) return empty;

  const seed = options.seed ?? deriveSeed(state.seed, state.turn, Number(playerId.replace(/\D/g, '')) || 0);
  const rng: Rng = createRng(seed);
  const analysed = moves.map((m) => analyse(state, me, m, difficulty === 'hard'));
  const forced = moves.every((m) => m.capturesBoss);
  let chosen: MoveFactors;
  let random = false;
  let depth: number | undefined;
  let endgame = false;

  if (difficulty === 'easy') {
    for (const a of analysed) a.factors.value = easyValue(a.factors);
    if (rng.next() < 0.15) {
      chosen = rng.pick(analysed).factors;
      random = true;
    } else {
      // Scelta "softmax": preferisce le mosse migliori ma può sbagliare.
      const T = 1.5;
      const maxV = Math.max(...analysed.map((a) => a.factors.value));
      const w = analysed.map((a) => Math.exp((a.factors.value - maxV) / T));
      const sum = w.reduce((s, x) => s + x, 0);
      let r = rng.next() * sum;
      chosen = analysed[analysed.length - 1].factors;
      for (let i = 0; i < analysed.length; i++) {
        r -= w[i];
        if (r <= 0) {
          chosen = analysed[i].factors;
          break;
        }
      }
    }
  } else if (difficulty === 'medium') {
    for (const a of analysed) a.factors.value = mediumValue(state, me, a.factors, a.next) + rng.next() * 0.05;
    chosen = analysed.reduce((b, a) => (a.factors.value > b.factors.value ? a : b)).factors;
  } else {
    depth = Math.max(1, Math.min(4, options.searchDepth ?? defaultSearchDepth(state)));
    const ctx: SearchCtx = { me: me.id, nodes: 0 };
    const remaining = state.gangs.reduce((s, g) => s + g.henchmen.length, 0);
    let solved = false;
    if (remaining <= HARD_TUNING.endgameCards) {
      try {
        const budget = { nodes: HARD_TUNING.endgameBudget };
        const idx = state.currentPlayerIndex;
        for (const a of analysed) a.factors.value = maxn(a.next, budget)[idx] + rng.next() * 0.01;
        solved = true;
        endgame = true;
      } catch (e) {
        if (!(e instanceof BudgetExceeded)) throw e;
      }
    }
    if (!solved) {
      for (const a of analysed) a.factors.value = search(a.next, depth, ctx) + rng.next() * 0.01;
    }
    chosen = analysed.reduce((b, a) => (a.factors.value > b.factors.value ? a : b)).factors;
  }

  // Doppio controllo: il BOT usa la stessa validazione dei giocatori umani.
  const check = validateMove(state, chosen.move, me.id);
  if (!check.ok) throw new Error(`Il BOT ha prodotto una mossa non valida: ${check.error}`);

  const all = analysed.map((a) => a.factors);
  return {
    move: chosen.move,
    reason: explain(difficulty, chosen, all, { random, depth, evaluated: moves.length, forced, endgame }),
    difficulty,
    evaluated: moves.length,
    factors: chosen,
    ranking: all
      .map((f) => ({ move: f.move, value: Math.round(f.value * 100) / 100 }))
      .sort((a, b) => b.value - a.value),
  };
}

export const DIFFICULTY_LABEL: Record<BotDifficulty, string> = {
  easy: 'Facile',
  medium: 'Medio',
  hard: 'Difficile',
};
