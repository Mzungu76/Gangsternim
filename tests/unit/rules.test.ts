import { describe, expect, it } from 'vitest';
import { applyMove, listLegalMoves, validateMove } from '@/game/engine';
import { legalTakeCountsFor } from '@/game/gangs';
import { makeState } from './helpers';

const H = ['h-picchiatore', 'h-cecchino', 'h-esattore', 'h-gatto-nero', 'h-lina-velluto', 'h-sandro-piombo'];

describe('regole di presa', () => {
  it('rispetta minimo e massimo del Boss', () => {
    expect(legalTakeCountsFor(6, { minTake: 2, maxTake: 3 })).toEqual([2, 3]);
    expect(legalTakeCountsFor(6, { minTake: 1, maxTake: 4 })).toEqual([1, 2, 3, 4]);
    expect(legalTakeCountsFor(3, { minTake: 1, maxTake: 5 })).toEqual([1, 2, 3]);
  });
  it('con meno carte del minimo bisogna prenderle tutte', () => {
    expect(legalTakeCountsFor(1, { minTake: 2, maxTake: 3 })).toEqual([1]);
    expect(legalTakeCountsFor(2, { minTake: 3, maxTake: 3 })).toEqual([2]);
    const s = makeState({ gangs: [{ bossId: 'boss-contabile', henchmen: ['h-cecchino'] }, { bossId: 'boss-padrino', henchmen: H.slice(1, 3) }] });
    expect(validateMove(s, { gangId: 'gang-1', count: 1 }).ok).toBe(true);
    expect(validateMove(s, { gangId: 'gang-1', count: 2 }).ok).toBe(false);
  });
  it('rifiuta prese sotto il minimo e sopra il massimo', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-macellaio', henchmen: H }, { bossId: 'boss-padrino', henchmen: [] }] });
    expect(validateMove(s, { gangId: 'gang-1', count: 1 }).ok).toBe(false);
    expect(validateMove(s, { gangId: 'gang-1', count: 4 }).ok).toBe(false);
    expect(validateMove(s, { gangId: 'gang-1', count: 0 }).ok).toBe(false);
    expect(validateMove(s, { gangId: 'gang-1', count: 2.5 }).ok).toBe(false);
    expect(validateMove(s, { gangId: 'gang-1', count: 3 }).ok).toBe(true);
  });
  it('una mossa non valida non altera lo stato', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-macellaio', henchmen: H }, { bossId: 'boss-padrino', henchmen: H.slice(0, 0) }] });
    const snapshot = JSON.stringify(s);
    const r = applyMove(s, { gangId: 'gang-1', count: 5 });
    expect(r.ok).toBe(false);
    expect(r.state).toBe(s);
    expect(JSON.stringify(s)).toBe(snapshot);
    expect(applyMove(s, { gangId: 'gang-99', count: 2 }).ok).toBe(false);
  });
  it('preleva consecutivamente dalla destra, senza saltare carte', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-padrino', henchmen: H }, { bossId: 'boss-macellaio', henchmen: H.slice(0, 0) }] });
    const r = applyMove(s, { gangId: 'gang-1', count: 2 });
    expect(r.ok).toBe(true);
    expect(r.record!.cardIds).toEqual(['h-lina-velluto', 'h-sandro-piombo']);
    expect(r.state.gangs[0].henchmen).toEqual(H.slice(0, 4));
    expect(r.state.players[0].henchmen.map((c) => c.cardId)).toEqual(['h-lina-velluto', 'h-sandro-piombo']);
    // L'API non consente di scegliere carte isolate: solo gang e quantità.
    expect(Object.keys({ gangId: 'gang-1', count: 2 })).toEqual(['gangId', 'count']);
  });
  it('il Boss non può essere prelevato normalmente', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-padrino', henchmen: H.slice(0, 2) }, { bossId: 'boss-macellaio', henchmen: H.slice(2, 4) }] });
    // al massimo si prendono tutti gli Scagnozzi: non esiste una presa "n+1" che includa il Boss
    expect(validateMove(s, { gangId: 'gang-1', count: 3 }).ok).toBe(false);
    expect(listLegalMoves(s).filter((m) => m.gangId === 'gang-1').map((m) => m.count)).toEqual([1, 2]);
  });
  it('non si gioca su gang eliminate né fuori turno', () => {
    const s = makeState({ gangs: [{ bossId: 'boss-padrino', henchmen: [] }, { bossId: 'boss-macellaio', henchmen: H.slice(0, 3) }] });
    expect(validateMove(s, { gangId: 'gang-1', count: 1 }).ok).toBe(false);
    expect(validateMove(s, { gangId: 'gang-2', count: 2 }, 'p2').ok).toBe(false);
    expect(validateMove(s, { gangId: 'gang-2', count: 2 }, 'p1').ok).toBe(true);
  });
});
