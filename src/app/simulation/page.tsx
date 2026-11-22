'use client';
import { useRef, useState } from 'react';
import { Download, Play, Square } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { DIFFICULTY_LABEL } from '@/game/bot/botEngine';
import { bossInsights, cardInsights, simulationReportMarkdown } from '@/game/report';
import { createSimulationAccumulator, scoreHistogram, type SimulationConfig, type SimulationResult } from '@/game/simulation';
import type { BotDifficulty } from '@/game/types';

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export default function SimulationPage() {
  const [bots, setBots] = useState<BotDifficulty[]>(['easy', 'medium', 'hard']);
  const [gangCount, setGangCount] = useState(4);
  const [hMin, setHMin] = useState(4);
  const [hMax, setHMax] = useState(6);
  const [games, setGames] = useState(1000);
  const [seed, setSeed] = useState(2026);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stopRef = useRef(false);

  const run = () => {
    const config: SimulationConfig = { bots, gangCount, henchmenMin: Math.min(hMin, hMax), henchmenMax: Math.max(hMin, hMax), games: Math.max(1, Math.min(20000, games)), seed };
    const acc = createSimulationAccumulator(config);
    stopRef.current = false;
    setRunning(true);
    setResult(null);
    setError(null);
    setProgress(0);
    let i = 0;
    // Partite eseguite a blocchi per non bloccare l'interfaccia.
    const step = () => {
      try {
        const until = performance.now() + 40;
        while (i < config.games && performance.now() < until && !stopRef.current) acc.playOne(i++);
      } catch (e) {
        setError(String(e));
        setRunning(false);
        return;
      }
      setProgress(i);
      if (i < config.games && !stopRef.current) setTimeout(step, 0);
      else {
        setResult(acc.result());
        setRunning(false);
      }
    };
    setTimeout(step, 0);
  };

  const download = () => {
    if (!result) return;
    const cards = cardInsights(result);
    const md = [
      '# Report di simulazione — Gangster Nim',
      '',
      simulationReportMarkdown(result),
      '## Carte (tasso di vittoria del possessore)',
      '',
      '| Carta | Distribuita | % vittorie possessore | Scarto |',
      '|---|---|---|---|',
      ...cards.map((c) => `| ${c.name} | ${c.dealt} | ${pct(c.ownerWinRate)} | ${(c.delta * 100).toFixed(1)} |`),
      '',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `gangster-nim-simulazione-${result.config.seed}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = result ? cardInsights(result) : [];
  const bossesI = result ? bossInsights(result) : [];

  return (
    <PageShell title="Simulazione e bilanciamento">
      <p className="mb-4 max-w-3xl text-cream">
        Partite giocate solo da BOT, riproducibili con il seed. Le statistiche aiutano a individuare carte e Boss troppo forti o troppo deboli;
        il bilanciamento non viene mai modificato automaticamente.
      </p>
      <section className="gn-panel mb-6 grid gap-4 p-4 md:grid-cols-2">
        <div>
          <span className="gn-label">BOT al tavolo ({bots.length})</span>
          <ul className="grid gap-2">
            {bots.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-16 text-sm text-sand">Posto {i + 1}</span>
                <select aria-label={`Difficoltà BOT ${i + 1}`} className="gn-input" value={b} onChange={(e) => setBots(bots.map((x, j) => (j === i ? (e.target.value as BotDifficulty) : x)))}>
                  {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}
                </select>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" disabled={bots.length >= 4} onClick={() => setBots([...bots, 'medium'])}>+ BOT</button>
            <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" disabled={bots.length <= 2} onClick={() => setBots(bots.slice(0, -1))}>− BOT</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="gn-label" htmlFor="sg">Gang</label>
            <select id="sg" className="gn-input" value={gangCount} onChange={(e) => setGangCount(Number(e.target.value))}>{[2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select>
          </div>
          <div>
            <label className="gn-label" htmlFor="sn">Partite</label>
            <input id="sn" className="gn-input" type="number" min={1} max={20000} value={games} onChange={(e) => setGames(Number(e.target.value))} data-testid="sim-games" />
          </div>
          <div>
            <label className="gn-label" htmlFor="smin">Scagnozzi min</label>
            <select id="smin" className="gn-input" value={hMin} onChange={(e) => setHMin(Number(e.target.value))}>{[4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select>
          </div>
          <div>
            <label className="gn-label" htmlFor="smax">Scagnozzi max</label>
            <select id="smax" className="gn-input" value={hMax} onChange={(e) => setHMax(Number(e.target.value))}>{[4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select>
          </div>
          <div className="col-span-2">
            <label className="gn-label" htmlFor="ss">Seed</label>
            <input id="ss" className="gn-input" type="number" value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          {running ? (
            <button type="button" className="gn-btn gn-btn--danger" onClick={() => (stopRef.current = true)}><Square size={16} /> Interrompi</button>
          ) : (
            <button type="button" className="gn-btn" onClick={run} data-testid="sim-run"><Play size={16} /> Avvia simulazione</button>
          )}
          {running || progress ? (
            <div className="min-w-[12rem] flex-1">
              <div className="h-3 overflow-hidden rounded bg-black/40" role="progressbar" aria-valuemin={0} aria-valuemax={games} aria-valuenow={progress}>
                <div className="h-full bg-gold" style={{ width: `${(100 * progress) / Math.max(1, games)}%` }} />
              </div>
              <p className="mt-1 text-xs text-sand">{progress} / {games} partite</p>
            </div>
          ) : null}
        </div>
        {error ? <p role="alert" className="text-[#ff8a7a] md:col-span-2">{error}</p> : null}
      </section>

      {result ? (
        <div className="grid gap-6" data-testid="sim-result">
          <section className="gn-panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="gn-title text-2xl">Risultati ({result.games} partite)</h2>
              <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" onClick={download}><Download size={16} /> Scarica report</button>
            </div>
            <p className="mb-3 text-sm text-sand">Durata media {result.avgTurns.toFixed(2)} turni · {result.ties} vittorie ex aequo · calcolo {(result.durationMs / 1000).toFixed(1)} s</p>
            <div className="gn-scroll-x">
              <table className="gn-table">
                <thead><tr><th>Posto</th><th>BOT</th><th>% vittorie</th><th>Punti medi</th><th>Boss</th><th>Malus</th><th>Bonus</th><th>Combo</th><th>Coppie</th><th>Tris</th><th>Quartetti</th></tr></thead>
                <tbody>
                  {result.seats.map((s) => (
                    <tr key={s.seat}>
                      <td>{s.seat + 1}</td><td>{DIFFICULTY_LABEL[s.difficulty]}</td>
                      <td data-testid={`sim-win-${s.seat}`}>{pct(s.weightedWins / result.games)}</td>
                      <td>{(s.totalScore / result.games).toFixed(1)}</td>
                      <td>{(s.bosses / result.games).toFixed(2)}</td>
                      <td>{(s.malusNet / result.games).toFixed(2)}</td>
                      <td>{(s.bonus / result.games).toFixed(2)}</td>
                      <td>{(s.comboPoints / result.games).toFixed(2)}</td>
                      <td>{((s.combos['Coppia'] ?? 0) / result.games).toFixed(2)}</td>
                      <td>{((s.combos['Tris'] ?? 0) / result.games).toFixed(2)}</td>
                      <td>{((s.combos['Quartetto'] ?? 0) / result.games).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="gn-label mt-5">Confronto per difficoltà</h3>
            <ul className="grid gap-1 text-sm">
              {Object.entries(result.byDifficulty).map(([d, v]) => (
                <li key={d}>{DIFFICULTY_LABEL[d as BotDifficulty]}: {pct(v.winRate)} vittorie · {v.avgScore.toFixed(1)} punti · {v.avgBosses.toFixed(2)} Boss</li>
              ))}
            </ul>
          </section>

          <section className="gn-panel p-4">
            <h2 className="gn-title mb-3 text-2xl">Distribuzione dei punteggi</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {result.seats.map((s) => {
                const h = scoreHistogram(s.scores, 5);
                const max = Math.max(...h.map((b) => b.count));
                return (
                  <figure key={s.seat}>
                    <figcaption className="mb-1 text-sm text-sand">Posto {s.seat + 1} — {DIFFICULTY_LABEL[s.difficulty]}</figcaption>
                    <div className="flex h-28 items-end gap-0.5">
                      {h.map((b) => (
                        <div key={b.from} className="flex-1 rounded-t bg-gold/80" style={{ height: `${(100 * b.count) / max}%` }} title={`${b.from}…${b.to}: ${b.count}`} />
                      ))}
                    </div>
                    <div className="flex justify-between text-[0.7rem] text-sand"><span>{h[0]?.from}</span><span>{h[h.length - 1]?.to}</span></div>
                  </figure>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="gn-panel p-4">
              <h2 className="gn-title mb-1 text-2xl">Carte</h2>
              <p className="mb-3 text-xs text-sand">Tasso di vittoria di chi possedeva la carta a fine partita, rispetto all&apos;atteso ({pct(1 / result.config.bots.length)}). Più affidabile con BOT dello stesso livello.</p>
              <div className="gn-scroll-x max-h-96 overflow-y-auto">
                <table className="gn-table">
                  <thead><tr><th>Carta</th><th>Uscita</th><th>% vitt.</th><th>Scarto</th></tr></thead>
                  <tbody>
                    {cards.map((c) => (
                      <tr key={c.id}><td>{c.name}</td><td>{c.dealt}</td><td>{pct(c.ownerWinRate)}</td><td className={c.delta > 0.05 ? 'text-gold-2' : c.delta < -0.05 ? 'text-[#ff8a7a]' : ''}>{(c.delta * 100).toFixed(1)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="gn-panel p-4">
              <h2 className="gn-title mb-1 text-2xl">Boss</h2>
              <p className="mb-3 text-xs text-sand">Tasso di vittoria di chi ha conquistato il Boss.</p>
              <div className="gn-scroll-x">
                <table className="gn-table">
                  <thead><tr><th>Boss</th><th>Malus</th><th>Uscito</th><th>% vitt.</th></tr></thead>
                  <tbody>
                    {bossesI.map((b) => (
                      <tr key={b.id}><td>{b.name}</td><td>-{b.malus}</td><td>{b.dealt}</td><td>{pct(b.capturerWinRate)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
