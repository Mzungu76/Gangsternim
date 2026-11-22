import { describe, expect, it } from 'vitest';
import { computeCombos, emptySpecRecord, groupCount, pointsForCount } from '@/game/combos';
import { applyMove } from '@/game/engine';
import { computeScore } from '@/game/scoring';
import { makeState } from './helpers';

describe('combo', () => {
  it('coppia, tris, quartetto', () => {
    expect(pointsForCount(1)).toBe(0);
    expect(pointsForCount(2)).toBe(2);
    expect(pointsForCount(3)).toBe(5);
    expect(pointsForCount(4)).toBe(9);
  });
  it('cinque carte = un quartetto e una carta singola', () => {
    expect(groupCount(5).map((c) => c.id)).toEqual(['quartetto']);
    expect(pointsForCount(5)).toBe(9);
  });
  it('gruppi multipli: ogni gruppo completo vale separatamente', () => {
    expect(groupCount(6).map((c) => c.id)).toEqual(['quartetto', 'coppia']);
    expect(pointsForCount(7)).toBe(14);
    expect(pointsForCount(8)).toBe(18);
  });
  it('combina più specializzazioni senza doppi conteggi', () => {
    const counts = emptySpecRecord();
    counts.picchiatore = 3;
    counts.ladro = 2;
    counts.autista = 1;
    const r = computeCombos(counts);
    expect(r.points).toBe(7);
    expect(r.groups).toHaveLength(2);
    const aut = r.progress.find((p) => p.specialization === 'autista')!;
    expect(aut.missingForNext).toBe(1);
    expect(aut.nextComboName).toBe('Coppia');
    const pic = r.progress.find((p) => p.specialization === 'picchiatore')!;
    expect(pic.nextComboName).toBe('Quartetto');
  });
  it('il jolly viene assegnato alla specializzazione più vantaggiosa', () => {
    const counts = emptySpecRecord();
    counts.picchiatore = 3;
    counts.ladro = 1;
    const r = computeCombos(counts, 1);
    // 3→4 picchiatori: +4 punti; 1→2 ladri: +2 punti → sceglie picchiatore
    expect(r.wildcardAssignment).toEqual(['picchiatore']);
    expect(r.points).toBe(9);
  });
  it('aggiorna le combinazioni dopo ogni presa', () => {
    const s = makeState({
      gangs: [
        { bossId: 'boss-padrino', henchmen: ['h-picchiatore', 'h-gigi-nocche', 'h-tano-bisonte', 'h-bruno-martello', 'h-cecchino'] },
        { bossId: 'boss-macellaio', henchmen: ['h-gatto-nero', 'h-esattore', 'h-avv-sbarra'] },
      ],
    });
    let st = applyMove(s, { gangId: 'gang-1', count: 2 }).state; // p1: cecchino, bruno
    expect(computeScore(st.players[0], st.players).combo).toBe(0);
    st = applyMove(st, { gangId: 'gang-2', count: 2 }).state; // p2
    st = applyMove(st, { gangId: 'gang-1', count: 1 }).state; // p1: + tano (picchiatore) → coppia
    expect(computeScore(st.players[0], st.players).combo).toBe(2);
    st = applyMove(st, { gangId: 'gang-2', count: 1 }).state; // p2 prende il Macellaio
    st = applyMove(st, { gangId: 'gang-1', count: 2 }).state; // p1: + gigi + picchiatore → 4 picchiatori
    const sc = computeScore(st.players[0], st.players);
    expect(sc.combos.groups.map((g) => g.comboId)).toEqual(['quartetto']);
    expect(sc.combo).toBe(9);
  });
});
