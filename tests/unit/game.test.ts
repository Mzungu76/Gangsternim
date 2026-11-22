import { describe, expect, it } from 'vitest';
import { decideMove } from '@/game/bot/botEngine';
import { applyMove, computeRanking, createGame, validateConfig } from '@/game/engine';
import { HENCHMEN } from '@/game/catalog';
import { buildHistoryEntry } from '@/lib/history';
import { addHistoryEntry, clearHistory, isValidGameState, loadGame, loadHistory, loadSettings, memoryStore, saveGame, saveSettings, STORAGE_KEYS } from '@/lib/storage';
import type { GameConfig } from '@/game/types';
import { makeState } from './helpers';

const cfg = (over: Partial<GameConfig> = {}): GameConfig => ({
  players: [
    { name: 'Anna', type: 'human' },
    { name: 'Il Padrino', type: 'bot', difficulty: 'hard' },
  ],
  gangCount: 4,
  henchmenMin: 4,
  henchmenMax: 6,
  seed: 77,
  ...over,
});

function playOut(state: ReturnType<typeof createGame>) {
  let s = state;
  while (s.status === 'playing') {
    const p = s.players[s.currentPlayerIndex];
    const d = decideMove(s, p.id, p.difficulty ?? 'medium');
    s = applyMove(s, d.move!, { playerId: p.id }).state;
  }
  return s;
}

describe('partita', () => {
  it('distribuisce Boss e Scagnozzi senza duplicati, 4-6 per gang', () => {
    for (let seed = 1; seed < 30; seed++) {
      const g = createGame(cfg({ seed, gangCount: 6 }));
      const bosses = g.gangs.map((x) => x.bossId);
      expect(new Set(bosses).size).toBe(6);
      const cards = g.gangs.flatMap((x) => x.henchmen);
      expect(new Set(cards).size).toBe(cards.length);
      for (const x of g.gangs) expect(x.henchmen.length).toBeGreaterThanOrEqual(4);
      for (const x of g.gangs) expect(x.henchmen.length).toBeLessThanOrEqual(6);
    }
    expect(createGame(cfg({ seed: 5 })).gangs).toEqual(createGame(cfg({ seed: 5 })).gangs);
    expect(HENCHMEN.length).toBeGreaterThan(36);
  });
  it('valida la configurazione', () => {
    expect(validateConfig(cfg({ players: [{ name: 'A', type: 'human' }] }))).not.toEqual([]);
    expect(validateConfig(cfg({ gangCount: 7 }))).not.toEqual([]);
    expect(validateConfig(cfg({ henchmenMin: 6, henchmenMax: 4 }))).not.toEqual([]);
    expect(validateConfig(cfg())).toEqual([]);
  });
  it('passaggio del turno in senso orario', () => {
    const g = createGame(cfg({ players: [{ name: 'A', type: 'human' }, { name: 'B', type: 'human' }, { name: 'C', type: 'human' }] }));
    expect(g.currentPlayerIndex).toBe(0);
    const gang = g.gangs[0];
    const s1 = applyMove(g, { gangId: gang.id, count: 1 + 0 }).state;
    const ok1 = s1.currentPlayerIndex === 1 || !applyMove(g, { gangId: gang.id, count: 1 }).ok;
    expect(ok1).toBe(true);
    let s = g;
    for (let i = 0; i < 4 && s.status === 'playing'; i++) {
      const p = s.players[s.currentPlayerIndex];
      const before = s.currentPlayerIndex;
      s = applyMove(s, decideMove(s, p.id, 'medium').move!).state;
      if (s.status === 'playing') expect(s.currentPlayerIndex).toBe((before + 1) % 3);
    }
  });
  it('partite con umani e BOT, e partite con soli BOT, fino alla fine con classifica', () => {
    const mixed = playOut(createGame(cfg()));
    expect(mixed.status).toBe('finished');
    const bots = playOut(createGame(cfg({ players: [1, 2, 3, 4].map((i) => ({ name: `B${i}`, type: 'bot', difficulty: 'medium' })) })));
    const rank = computeRanking(bots);
    expect(rank).toHaveLength(4);
    expect(rank[0].rank).toBe(1);
    for (let i = 1; i < rank.length; i++) expect(rank[i].score.total).toBeLessThanOrEqual(rank[i - 1].score.total);
  });
  it('gestione delle parità: spareggio sul malus, poi vittoria ex aequo', () => {
    const tie = makeState({
      gangs: [{ bossId: 'boss-padrino', henchmen: [] }, { bossId: 'boss-fantasma', henchmen: [] }],
      players: [{ henchmen: ['h-picchiatore'] }, { henchmen: ['h-esattore'] }],
    });
    const r = computeRanking(tie);
    expect(r.map((x) => x.rank)).toEqual([1, 1]);
    expect(r.every((x) => x.isWinner)).toBe(true);
    const tb = makeState({
      gangs: [{ bossId: 'boss-padrino', henchmen: [] }, { bossId: 'boss-fantasma', henchmen: [] }],
      players: [{ henchmen: ['h-cecchino', 'h-picchiatore'], bosses: ['boss-professore'] }, { henchmen: ['h-picchiatore'.replace('picchiatore', 'esattore'), 'h-ombra'] }],
    });
    // p1: 7-2 = 5; p2: 3+2 = 5 → vince p2 (malus netto inferiore)
    const r2 = computeRanking(tb);
    expect(r2[0].playerId).toBe('p2');
    expect(r2[1].rank).toBe(2);
  });
  it('salvataggio e ripristino', () => {
    const store = memoryStore();
    let s = createGame(cfg());
    s = applyMove(s, { gangId: s.gangs[0].id, count: s.gangs[0].henchmen.length > 4 ? 1 : 1 }).ok ? applyMove(s, { gangId: s.gangs[0].id, count: 1 }).state : s;
    expect(saveGame(s, store)).toBe(true);
    const loaded = loadGame(store);
    expect(loaded).toEqual(s);
    expect(isValidGameState(loaded)).toBe(true);
  });
  it('scarta dati corrotti o di versione diversa senza errori', () => {
    const store = memoryStore();
    store.setItem(STORAGE_KEYS.game, '{non json');
    expect(loadGame(store)).toBeNull();
    store.setItem(STORAGE_KEYS.game, JSON.stringify({ version: 999, data: {} }));
    expect(loadGame(store)).toBeNull();
    const s = createGame(cfg());
    const broken = { ...s, gangs: [{ ...s.gangs[0], henchmen: ['carta-inesistente'] }] };
    store.setItem(STORAGE_KEYS.game, JSON.stringify({ version: 1, data: broken }));
    expect(loadGame(store)).toBeNull();
    expect(store.getItem(STORAGE_KEYS.game)).toBeNull();
    store.setItem(STORAGE_KEYS.settings, JSON.stringify({ version: 1, data: { botSpeed: 'warp' } }));
    expect(loadSettings(store).botSpeed).toBe('normal');
    saveSettings({ botSpeed: 'slow', showBotReasons: false, showDebugPanel: true, animations: false }, store);
    expect(loadSettings(store)).toEqual({ botSpeed: 'slow', showBotReasons: false, showDebugPanel: true, animations: false });
  });
  it('storico: aggiunta e cancellazione', () => {
    const store = memoryStore();
    const fin = playOut(createGame(cfg()));
    addHistoryEntry(buildHistoryEntry(fin), store);
    addHistoryEntry(buildHistoryEntry(fin), store); // stesso id: nessun duplicato
    const h = loadHistory(store);
    expect(h).toHaveLength(1);
    expect(h[0].players).toHaveLength(2);
    expect(h[0].winners.length).toBeGreaterThan(0);
    clearHistory(store);
    expect(loadHistory(store)).toEqual([]);
  });
});
