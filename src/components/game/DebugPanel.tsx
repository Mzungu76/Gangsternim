import { getBoss, getHenchman } from '@/game/catalog';
import { listLegalMoves } from '@/game/engine';
import { tableNimXor } from '@/game/nim';
import type { ScoreBreakdown } from '@/game/scoring';
import type { GameState } from '@/game/types';
import type { BotLogEntry } from '@/lib/gameStore';

export function DebugPanel({ game, scores, botLog, onClose }: { game: GameState; scores: ScoreBreakdown[]; botLog: BotLogEntry[]; onClose: () => void }) {
  return (
    <aside className="gn-panel gn-type mt-6 p-3 text-xs" aria-label="Pannello di debug" data-testid="debug-panel">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-label text-sm uppercase tracking-widest text-gold-2">Pannello di debug</h2>
        <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" onClick={onClose}>Nascondi</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <h3 className="mb-1 text-sand">Turno {game.turn} · stato {game.status} · seed {game.seed} · XOR prese sicure {tableNimXor(game)}</h3>
          <p>Mosse legali: {listLegalMoves(game).map((m) => `${m.gangId}×${m.count}${m.capturesBoss ? '(B)' : ''}`).join(' ') || '—'}</p>
          <h3 className="mb-1 mt-2 text-sand">Gang</h3>
          <ul>
            {game.gangs.map((g) => (
              <li key={g.id}>
                {g.id} [{getBoss(g.bossId).name} {getBoss(g.bossId).minTake}-{getBoss(g.bossId).maxTake}] prese {g.takes} {g.eliminated ? `ELIMINATA (${g.capturedBy})` : ''}: {g.henchmen.join(', ') || '—'}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 text-sand">Giocatori</h3>
          <ul className="grid gap-1">
            {game.players.map((p, i) => {
              const s = scores[i];
              return (
                <li key={p.id}>
                  <b>{p.id} {p.name}</b> ({p.type}{p.difficulty ? `/${p.difficulty}` : ''}) tot {s.total} = base {s.base} + imm {s.immediate} + cond {s.conditional} + combo {s.combo} - malus {s.malusNet} (lordo {s.malusGross})
                  <br />carte: {p.henchmen.map((c) => `${getHenchman(c.cardId).name}${c.immediateBonus ? `(+${c.immediateBonus})` : ''}`).join(', ') || '—'}
                  <br />combo: {s.combos.groups.map((g) => `${g.name} ${g.specialization}`).join(', ') || '—'} {s.combos.wildcardAssignment.length ? `jolly→${s.combos.wildcardAssignment.join(',')}` : ''}
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h3 className="mb-1 text-sand">Storico mosse</h3>
          <ol className="max-h-56 overflow-auto">
            {game.history.map((h) => (
              <li key={h.turn}>
                T{h.turn} {h.playerId} → {h.gangId} ×{h.count} [{h.cardIds.join(', ')}]{h.bossCaptured ? ' + BOSS' : ''}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h3 className="mb-1 text-sand">Decisioni BOT</h3>
          <ol className="max-h-56 overflow-auto">
            {botLog.slice().reverse().map((b, i) => (
              <li key={i} className="mb-1">
                T{b.turn} {b.playerName} ({b.decision.difficulty}, {b.ms} ms, {b.decision.evaluated} mosse): {b.decision.move ? `${b.decision.move.gangId}×${b.decision.move.count}` : '—'}
                <br />valori: {b.decision.ranking.slice(0, 5).map((r) => `${r.move.gangId}×${r.move.count}=${r.value}`).join(' · ')}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </aside>
  );
}
