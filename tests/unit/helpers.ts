import { createGame } from '@/game/engine';
import type { GameState, GangState, PlayerState } from '@/game/types';

/** Crea uno stato di gioco controllato per test di situazioni specifiche. */
export function makeState(opts: {
  gangs: { bossId: string; henchmen: string[]; takes?: number }[];
  players?: { henchmen?: string[]; bosses?: string[]; immediate?: Record<string, number>; type?: 'human' | 'bot' }[];
  current?: number;
}): GameState {
  const base = createGame(
    {
      players: (opts.players ?? [{}, {}]).map((p, i) => ({ name: `G${i + 1}`, type: p.type ?? 'human', difficulty: p.type === 'bot' ? 'medium' : undefined })),
      gangCount: 2,
      henchmenMin: 4,
      henchmenMax: 4,
      seed: 1,
    },
    { id: 'test', now: '2026-01-01T00:00:00.000Z' },
  );
  const gangs: GangState[] = opts.gangs.map((g, i) => ({
    id: `gang-${i + 1}`,
    bossId: g.bossId,
    henchmen: [...g.henchmen],
    initialSize: g.henchmen.length,
    takes: g.takes ?? 0,
    eliminated: g.henchmen.length === 0,
    capturedBy: null,
  }));
  const players: PlayerState[] = base.players.map((p, i) => {
    const o = opts.players?.[i] ?? {};
    return {
      ...p,
      henchmen: (o.henchmen ?? []).map((id) => ({ cardId: id, turn: 0, gangId: 'x', immediateBonus: o.immediate?.[id] ?? 0 })),
      bosses: (o.bosses ?? []).map((id) => ({ cardId: id, turn: 0, gangId: 'x' })),
    };
  });
  return { ...base, gangs, players, currentPlayerIndex: opts.current ?? 0, status: gangs.every((g) => g.eliminated) ? 'finished' : 'playing' };
}

export function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object') {
    Object.freeze(o);
    for (const v of Object.values(o as object)) deepFreeze(v);
  }
  return o;
}
