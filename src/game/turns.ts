import type { GameState } from './types';

/** Turni in senso orario: l'indice successivo, ciclico. */
export function nextPlayerIndex(state: Pick<GameState, 'players' | 'currentPlayerIndex'>): number {
  return (state.currentPlayerIndex + 1) % state.players.length;
}

export function currentPlayer(state: GameState) {
  return state.players[state.currentPlayerIndex];
}
