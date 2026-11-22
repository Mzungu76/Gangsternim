'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { ConfirmButton } from '@/components/ConfirmButton';
import { PageShell } from '@/components/PageShell';
import { DIFFICULTY_LABEL } from '@/game/bot/botEngine';
import { clearHistory, useHistory } from '@/lib/historyStore';

export default function StatsPage() {
  const history = useHistory();

  const byName = useMemo(() => {
    const m = new Map<string, { name: string; games: number; wins: number; total: number; best: number; bosses: number }>();
    for (const h of history ?? []) {
      for (const p of h.players) {
        const key = p.type === 'bot' ? `${p.name} (BOT ${p.difficulty ? DIFFICULTY_LABEL[p.difficulty] : ''})` : p.name;
        const e = m.get(key) ?? { name: key, games: 0, wins: 0, total: 0, best: -Infinity, bosses: 0 };
        e.games++;
        if (p.rank === 1) e.wins++;
        e.total += p.total;
        e.best = Math.max(e.best, p.total);
        e.bosses += p.bosses;
        m.set(key, e);
      }
    }
    return [...m.values()].sort((a, b) => b.wins / b.games - a.wins / a.games || b.games - a.games);
  }, [history]);

  if (history === null) return <PageShell title="Statistiche"><p className="text-sand">Caricamento…</p></PageShell>;

  return (
    <PageShell
      title="Statistiche"
      actions={
        history.length ? (
          <ConfirmButton label="Cancella storico" confirmLabel="Sì, cancella tutto lo storico" onConfirm={clearHistory} className="gn-btn gn-btn--danger gn-btn--sm" testId="clear-history" />
        ) : null
      }
    >
      {history.length === 0 ? (
        <div className="gn-panel max-w-xl p-6" data-testid="stats-empty">
          <p>Nessuna partita conclusa finora. Le statistiche compaiono qui alla fine di ogni partita.</p>
          <Link href="/setup" className="gn-btn mt-4">Gioca la prima partita</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          <section className="gn-panel p-4">
            <h2 className="gn-title mb-3 text-2xl">Giocatori ({history.length} partite)</h2>
            <div className="gn-scroll-x">
              <table className="gn-table" data-testid="stats-table">
                <thead><tr><th>Giocatore</th><th>Partite</th><th>Vittorie</th><th>% vittorie</th><th>Media punti</th><th>Record</th><th>Boss/partita</th></tr></thead>
                <tbody>
                  {byName.map((e) => (
                    <tr key={e.name}>
                      <td>{e.name}</td><td>{e.games}</td><td>{e.wins}</td><td>{Math.round((100 * e.wins) / e.games)}%</td>
                      <td>{(e.total / e.games).toFixed(1)}</td><td>{e.best}</td><td>{(e.bosses / e.games).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <section className="gn-panel p-4">
            <h2 className="gn-title mb-3 text-2xl">Storico</h2>
            <ul className="grid gap-2">
              {history.map((h) => (
                <li key={h.id} className="rounded-lg border border-gold/20 p-3 text-sm">
                  <div className="text-sand">{new Date(h.finishedAt).toLocaleString('it-IT')} · {h.turns} turni · {h.gangCount} gang</div>
                  <div>
                    Vincitore: <b className="text-gold-2">{h.winners.join(', ')}</b> —{' '}
                    {[...h.players].sort((a, b) => a.rank - b.rank).map((p) => `${p.rank}° ${p.name} ${p.total}`).join(' · ')}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </PageShell>
  );
}
