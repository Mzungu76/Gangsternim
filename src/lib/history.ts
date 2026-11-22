import { computeRanking } from '@/game/engine';
import type { GameState } from '@/game/types';
import type { HistoryEntry } from './storage';

export function buildHistoryEntry(state: GameState): HistoryEntry {
  const ranking = computeRanking(state);
  return {
    id: state.id,
    finishedAt: state.finishedAt ?? new Date().toISOString(),
    turns: state.history.length,
    gangCount: state.gangs.length,
    players: state.players.map((p) => {
      const r = ranking.find((x) => x.playerId === p.id)!;
      return { name: p.name, type: p.type, difficulty: p.difficulty, total: r.score.total, rank: r.rank, bosses: p.bosses.length };
    }),
    winners: ranking.filter((r) => r.isWinner).map((r) => r.name),
  };
}
