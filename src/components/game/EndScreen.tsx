import Link from 'next/link';
import { Trophy } from 'lucide-react';
import type { RankingEntry } from '@/game/engine';
import type { GameState } from '@/game/types';
import { PlayerBadge } from './PlayerPanel';
import { ActiveBonuses, ComboList, ScoreSummary } from './ScoreDetails';

export function EndScreen({ game, ranking, onRematch }: { game: GameState; ranking: RankingEntry[]; onRematch: () => void }) {
  const winners = ranking.filter((r) => r.isWinner);
  return (
    <section className="gn-panel p-4 sm:p-6" aria-labelledby="end-h" data-testid="end-screen">
      <div className="text-center">
        <Trophy className="mx-auto text-gold-2" size={40} aria-hidden />
        <h2 id="end-h" className="gn-title mt-2 text-3xl sm:text-4xl">Fine della partita</h2>
        <p className="mt-2 text-lg" data-testid="winner">
          {winners.length > 1
            ? `Pareggio! Vincono ex aequo: ${winners.map((w) => w.name).join(', ')}`
            : `Vince ${winners[0].name} con ${winners[0].score.total} punti`}
        </p>
        <p className="text-sm text-sand">{game.history.length} turni · risultato salvato nello storico</p>
      </div>

      <ol className="mt-6 grid gap-4 md:grid-cols-2">
        {ranking.map((r) => {
          const p = game.players.find((x) => x.id === r.playerId)!;
          return (
            <li key={r.playerId} className="rounded-xl border border-gold/25 bg-black/25 p-4" style={{ borderLeft: `6px solid ${p.color}` }} data-testid={`rank-${r.rank}`}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-3xl font-semibold text-gold-2">{r.rank}°</span>
                <span className="flex-1 text-xl font-semibold">{r.name}</span>
                <PlayerBadge p={p} />
              </div>
              <ScoreSummary s={r.score} />
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-sand">Riepilogo dettagliato</summary>
                <div className="mt-2 grid gap-3">
                  <div>
                    <h4 className="gn-label">Bonus individuali</h4>
                    <ActiveBonuses s={r.score} />
                  </div>
                  <div>
                    <h4 className="gn-label">Combo</h4>
                    <ComboList s={r.score} />
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-sand">Parità: prevale il malus netto più basso; se resta la parità, vittoria ex aequo.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="gn-btn" onClick={onRematch} data-testid="rematch">Rivincita (stessi giocatori)</button>
        <Link href="/setup" className="gn-btn gn-btn--ghost">Nuova partita</Link>
        <Link href="/" className="gn-btn gn-btn--ghost">Menu</Link>
      </div>
    </section>
  );
}
