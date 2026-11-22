import { describe, expect, it } from 'vitest';
import { applyMove } from '@/game/engine';
import { computeScore } from '@/game/scoring';
import { makeState } from './helpers';

describe('conquista dei Boss', () => {
  it('chi prende l\'ultimo Scagnozzo riceve il Boss, subisce il malus e la gang viene eliminata', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-pazzo', henchmen: ['h-cecchino', 'h-esattore'] }, { bossId: 'boss-padrino', henchmen: ['h-picchiatore'] }] });
    const r = applyMove(s, { gangId: 'gang-1', count: 2 });
    expect(r.ok).toBe(true);
    expect(r.record!.bossCaptured).toBe(true);
    const p = r.state.players[0];
    expect(p.bosses.map((b) => b.cardId)).toEqual(['boss-pazzo']);
    expect(r.state.gangs[0]).toMatchObject({ eliminated: true, capturedBy: 'p1', henchmen: [] });
    const sc = computeScore(p, r.state.players);
    expect(sc.base).toBe(4 + 3);
    expect(sc.malusGross).toBe(7);
    expect(sc.malusNet).toBe(7);
    expect(sc.total).toBe(7 - 7);
  });
  it('il malus è registrato separatamente dal punteggio degli Scagnozzi', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-professore', henchmen: ['h-cecchino'] }, { bossId: 'boss-padrino', henchmen: ['h-picchiatore'] }] });
    const r = applyMove(s, { gangId: 'gang-1', count: 1 });
    const sc = computeScore(r.state.players[0], r.state.players);
    expect(sc.base).toBe(4);
    expect(sc.lines.find((l) => l.category === 'malus')).toMatchObject({ cardId: 'boss-professore', points: -2 });
  });
  it('gestisce Boss differenti con limiti differenti', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-notaio', henchmen: ['h-cecchino', 'h-esattore', 'h-picchiatore', 'h-gatto-nero'] }, { bossId: 'boss-contabile', henchmen: ['h-lina-velluto', 'h-sandro-piombo', 'h-avv-sbarra'] }] });
    expect(applyMove(s, { gangId: 'gang-1', count: 2 }).ok).toBe(false);
    const r1 = applyMove(s, { gangId: 'gang-1', count: 3 });
    expect(r1.ok).toBe(true);
    // ora il Notaio ha 1 sola carta: il giocatore 2 può prenderla (forzato a prenderla tutta)
    expect(applyMove(r1.state, { gangId: 'gang-1', count: 1 }).ok).toBe(true);
    expect(applyMove(r1.state, { gangId: 'gang-2', count: 2 }).ok).toBe(true);
    expect(applyMove(r1.state, { gangId: 'gang-2', count: 3 }).ok).toBe(false);
  });
  it('la partita termina quando tutte le gang sono eliminate', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-padrino', henchmen: ['h-cecchino'] }, { bossId: 'boss-fantasma', henchmen: ['h-esattore'] }] });
    const r1 = applyMove(s, { gangId: 'gang-1', count: 1 });
    expect(r1.state.status).toBe('playing');
    const r2 = applyMove(r1.state, { gangId: 'gang-2', count: 1 });
    expect(r2.state.status).toBe('finished');
    expect(applyMove(r2.state, { gangId: 'gang-2', count: 1 }).ok).toBe(false);
  });
});
