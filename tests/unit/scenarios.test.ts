import { describe, expect, it } from 'vitest';
import { decideMove } from '@/game/bot/botEngine';
import { listLegalMoves } from '@/game/engine';
import { buildScenario, SCENARIOS } from '@/game/scenarios';
import { isValidGameState } from '@/lib/storage';

describe('scenari della modalità test', () => {
  for (const s of SCENARIOS) {
    it(`${s.title}: stato valido e giocabile`, () => {
      const st = buildScenario(s.spec, s.id);
      expect(isValidGameState(st)).toBe(true);
      expect(listLegalMoves(st).length).toBeGreaterThan(0);
    });
  }
  it('Boss obbligato: ogni mossa conquista un Boss e il BOT lo spiega', () => {
    const st = buildScenario(SCENARIOS.find((s) => s.id === 'boss-obbligato')!.spec);
    expect(listLegalMoves(st).every((m) => m.capturesBoss)).toBe(true);
    const next = { ...st, currentPlayerIndex: 1 };
    const d = decideMove(next, 'p2', 'hard');
    expect(d.reason).toMatch(/Non avevo alternative/);
  });
});
