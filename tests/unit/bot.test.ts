import { describe, expect, it } from 'vitest';
import { decideMove } from '@/game/bot/botEngine';
import { applyMove, createGame, listLegalMoves, validateMove } from '@/game/engine';
import { grundy } from '@/game/nim';
import { runSimulation } from '@/game/simulation';
import type { BotDifficulty, GameState } from '@/game/types';
import { deepFreeze, makeState } from './helpers';

const DIFFS: BotDifficulty[] = ['easy', 'medium', 'hard'];

function newGame(seed: number, bots: BotDifficulty[]): GameState {
  return createGame({ players: bots.map((d, i) => ({ name: `B${i}`, type: 'bot', difficulty: d })), gangCount: 4, henchmenMin: 4, henchmenMax: 6, seed });
}

describe('BOT', () => {
  it('produce sempre mosse valide e completa le partite (tutte le difficoltà, 2-4 giocatori)', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const bots = DIFFS.slice(0, 0).concat(Array.from({ length: 2 + (seed % 3) }, (_, i) => DIFFS[(seed + i) % 3]));
      let s = newGame(seed, bots);
      let guard = 0;
      while (s.status === 'playing') {
        const p = s.players[s.currentPlayerIndex];
        const d = decideMove(s, p.id, p.difficulty!);
        expect(d.move).not.toBeNull();
        expect(validateMove(s, d.move!, p.id).ok).toBe(true);
        expect(d.reason.length).toBeGreaterThan(10);
        s = applyMove(s, d.move!, { playerId: p.id }).state;
        expect(++guard).toBeLessThan(200);
      }
      expect(s.gangs.every((g) => g.eliminated)).toBe(true);
    }
  });
  it('non modifica lo stato della partita (stato congelato)', () => {
    const s = deepFreeze(newGame(5, ['hard', 'medium', 'easy']));
    const before = JSON.stringify(s);
    for (const d of DIFFS) {
      const p = s.players[s.currentPlayerIndex];
      expect(() => decideMove(s, p.id, d)).not.toThrow();
    }
    expect(JSON.stringify(s)).toBe(before);
  });
  it('segnala correttamente l\'assenza di mosse (partita finita o turno altrui)', () => {
    const fin = makeState({ gangs: [{ bossId: 'boss-padrino', henchmen: [] }, { bossId: 'boss-fantasma', henchmen: [] }] });
    expect(decideMove(fin, 'p1', 'hard').move).toBeNull();
    const s = newGame(3, ['medium', 'medium']);
    expect(decideMove(s, 'p2', 'medium').move).toBeNull();
  });
  it('è riproducibile con lo stesso seed', () => {
    const s = newGame(11, ['easy', 'easy']);
    for (const d of DIFFS) {
      const a = decideMove(s, 'p1', d, { seed: 42 });
      const b = decideMove(s, 'p1', d, { seed: 42 });
      expect(a.move).toEqual(b.move);
      expect(a.reason).toBe(b.reason);
    }
    const r1 = runSimulation({ bots: ['easy', 'hard'], gangCount: 3, henchmenMin: 4, henchmenMax: 5, games: 10, seed: 9 });
    const r2 = runSimulation({ bots: ['easy', 'hard'], gangCount: 3, henchmenMin: 4, henchmenMax: 5, games: 10, seed: 9 });
    expect(r1.seats.map((x) => x.scores)).toEqual(r2.seats.map((x) => x.scores));
  });
  it('usa solo informazioni pubbliche: decisione identica su una copia ricostruita dello stato visibile', () => {
    const s = newGame(21, ['hard', 'medium']);
    // Lo stato contiene solo informazioni visibili a tutti (carte scoperte): una copia serializzata dà la stessa decisione.
    const copy = JSON.parse(JSON.stringify(s));
    expect(decideMove(copy, 'p1', 'hard', { seed: 1 }).move).toEqual(decideMove(s, 'p1', 'hard', { seed: 1 }).move);
  });
  it('evita un Boss molto penalizzante quando ha alternative (medio e difficile)', () => {
    const s = makeState({
      gangs: [
        { bossId: 'boss-pazzo', henchmen: ['h-picchiatore'] },
        { bossId: 'boss-padrino', henchmen: ['h-esattore', 'h-gatto-nero', 'h-lina-velluto', 'h-sandro-piombo', 'h-avv-sbarra'] },
      ],
      players: [{ type: 'bot' }, { type: 'bot' }],
    });
    for (const d of ['medium', 'hard'] as BotDifficulty[]) {
      const dec = decideMove(s, 'p1', d, { seed: 3 });
      expect(dec.move!.gangId).toBe('gang-2');
    }
  });
  it('completa una combo quando conviene e lo spiega', () => {
    const s = makeState({
      gangs: [
        { bossId: 'boss-padrino', henchmen: ['h-esattore', 'h-picchiatore', 'h-gatto-nero', 'h-cecchino', 'h-orecchio-fino'] },
        { bossId: 'boss-macellaio', henchmen: ['h-ombra', 'h-avv-sbarra', 'h-tassametro', 'h-sandro-piombo'] },
      ],
      players: [{ type: 'bot', henchmen: ['h-vecchio-scassinatore', 'h-lina-velluto'] }, { type: 'bot' }],
    });
    const dec = decideMove(s, 'p1', 'medium', { seed: 1 });
    expect(dec.move).toMatchObject({ gangId: 'gang-1' });
    expect(dec.reason).toMatch(/Tris di Scassinatori/);
  });
  it('comportamenti diversi tra difficoltà', () => {
    let total = 0;
    const diff = { easyHard: 0, mediumHard: 0 };
    for (let seed = 1; seed <= 10; seed++) {
      let s = newGame(seed, ['medium', 'medium', 'medium']);
      while (s.status === 'playing') {
        const p = s.players[s.currentPlayerIndex];
        const e = decideMove(s, p.id, 'easy');
        const m = decideMove(s, p.id, 'medium');
        const h = decideMove(s, p.id, 'hard');
        total++;
        if (JSON.stringify(e.move) !== JSON.stringify(h.move)) diff.easyHard++;
        if (JSON.stringify(m.move) !== JSON.stringify(h.move)) diff.mediumHard++;
        s = applyMove(s, m.move!).state;
      }
    }
    expect(diff.easyHard / total).toBeGreaterThan(0.2);
    expect(diff.mediumHard / total).toBeGreaterThan(0.1);
  });
  it('il BOT difficile ottiene risultati migliori del facile su un campione ampio', () => {
    const r = runSimulation({ bots: ['easy', 'hard'], gangCount: 4, henchmenMin: 4, henchmenMax: 6, games: 200, seed: 123 });
    expect(r.byDifficulty.hard.winRate).toBeGreaterThan(r.byDifficulty.easy.winRate);
    expect(r.byDifficulty.hard.avgScore).toBeGreaterThan(r.byDifficulty.easy.avgScore);
  });
  it('analisi Nim: valori di Grundy del gioco delle prese sicure', () => {
    // prese 1..3: con 1 carta nessuna presa sicura → 0; con 2 → solo 1 → g(1)=0 → 1
    expect(grundy(1, 1, 3)).toBe(0);
    expect(grundy(2, 1, 3)).toBe(1);
    expect(grundy(5, 1, 3)).toBe(0);
    expect(grundy(1, 2, 2)).toBe(0);
    expect(grundy(3, 2, 2)).toBe(1);
    const s = newGame(2, ['hard', 'hard']);
    expect(listLegalMoves(s).length).toBeGreaterThan(0);
  });
});
