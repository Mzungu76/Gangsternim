'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bug, Check, Home, MessageSquareText, X } from 'lucide-react';
import { DebugPanel } from '@/components/game/DebugPanel';
import { EndScreen } from '@/components/game/EndScreen';
import { GangRow } from '@/components/game/GangRow';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { decideMove } from '@/game/bot/botEngine';
import { getBoss } from '@/game/catalog';
import { computeRanking } from '@/game/engine';
import { cardsForTake, legalTakeCounts } from '@/game/gangs';
import { randomSeed } from '@/game/rng';
import { computeAllScores } from '@/game/scoring';
import type { Move } from '@/game/types';
import { gameStore, useGameStore } from '@/lib/gameStore';
import { updateSettings, useSettings } from '@/lib/settingsStore';
import { BOT_DELAY_MS } from '@/lib/storage';

const ANIM_MS = 320;

export default function GamePage() {
  const { game, hydrated, lastError, botLog } = useGameStore();
  const settings = useSettings();
  const [sel, setSel] = useState<{ turn: number; gangId: string; count: number | null } | null>(null);
  const [leaving, setLeaving] = useState<{ gangId: string; ids: string[] } | null>(null);
  const [debugHidden, setDebugHidden] = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => gameStore.hydrate(), []);
  useEffect(() => () => {
    if (animTimer.current) clearTimeout(animTimer.current);
  }, []);

  const scores = useMemo(() => (game ? computeAllScores(game.players) : []), [game]);
  const ranking = useMemo(() => (game && game.status === 'finished' ? computeRanking(game) : null), [game]);
  const current = game ? game.players[game.currentPlayerIndex] : null;
  const playing = game?.status === 'playing';
  const botThinking = Boolean(playing && current?.type === 'bot' && !leaving);
  const humanTurn = Boolean(playing && current?.type === 'human' && !leaving);
  const selection = sel && game && sel.turn === game.turn ? sel : null;

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const commit = (move: Move, playerId: string, botReason?: string) => {
    if (!game) return;
    const gang = game.gangs.find((g) => g.id === move.gangId);
    if (!gang) return;
    if (settingsRef.current.animations) {
      setLeaving({ gangId: gang.id, ids: cardsForTake(gang, move.count) });
      animTimer.current = setTimeout(() => {
        gameStore.move(move, { playerId, botReason });
        setLeaving(null);
      }, ANIM_MS);
    } else {
      gameStore.move(move, { playerId, botReason });
    }
    setSel(null);
  };
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  // Turno dei BOT: pausa visiva non bloccante, poi decisione del motore.
  useEffect(() => {
    if (!game || game.status !== 'playing' || leaving) return;
    const p = game.players[game.currentPlayerIndex];
    if (p.type !== 'bot') return;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const d = decideMove(game, p.id, p.difficulty ?? 'medium');
      gameStore.logBot({ turn: game.turn, playerName: p.name, decision: d, ms: Math.round(performance.now() - t0) });
      if (d.move) commitRef.current(d.move, p.id, d.reason);
    }, BOT_DELAY_MS[settingsRef.current.botSpeed]);
    return () => clearTimeout(timer);
  }, [game, leaving]);

  if (!hydrated) {
    return <main className="p-8 text-center text-sand">Caricamento del tavolo…</main>;
  }
  if (!game || !current) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="gn-title text-3xl">Nessuna partita in corso</h1>
        <p className="mt-3 text-cream">Il tavolo è vuoto. Organizza una nuova riunione di famiglia.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/setup" className="gn-btn">Nuova partita</Link>
          <Link href="/" className="gn-btn gn-btn--ghost">Menu</Link>
        </div>
      </main>
    );
  }

  const selGang = selection ? game.gangs.find((g) => g.id === selection.gangId) ?? null : null;
  const selLegal = selGang ? legalTakeCounts(selGang) : [];
  const last = game.history[game.history.length - 1];
  const lastPlayer = last ? game.players.find((p) => p.id === last.playerId) : null;
  const showDebug = settings.showDebugPanel && !debugHidden;

  const chooseGang = (gangId: string) => {
    if (!humanTurn) return;
    const g = game.gangs.find((x) => x.id === gangId)!;
    const legal = legalTakeCounts(g);
    setSel({ turn: game.turn, gangId, count: legal.length === 1 ? legal[0] : null });
    gameStore.clearError();
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Barra superiore */}
      <header className="sticky top-0 z-20 border-b border-gold/30 bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:px-5">
          <Link href="/" className="gn-title text-xl leading-none" aria-label="Torna al menu">GANGSTER <span className="text-ivory">NIM</span></Link>
          <span className="text-sm text-sand" data-testid="turn">Turno {game.turn}</span>
          <span className="text-sm" data-testid="active-player">
            {playing ? (
              <>Tocca a <b style={{ color: current.color }}>{current.name}</b></>
            ) : (
              'Partita terminata'
            )}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" aria-pressed={settings.showBotReasons} onClick={() => updateSettings({ showBotReasons: !settings.showBotReasons })} title="Mostra/nascondi motivazioni BOT" aria-label="Mostra o nascondi le motivazioni dei BOT">
              <MessageSquareText size={16} />
            </button>
            <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" aria-pressed={showDebug} onClick={() => { if (!settings.showDebugPanel) { updateSettings({ showDebugPanel: true }); setDebugHidden(false); } else setDebugHidden((h) => !h); }} title="Pannello di debug" aria-label="Mostra o nascondi il pannello di debug" data-testid="toggle-debug">
              <Bug size={16} />
            </button>
            <Link href="/" className="gn-btn gn-btn--ghost gn-btn--sm" aria-label="Menu principale"><Home size={16} /></Link>
          </div>
          <ul className="gn-scroll-x flex w-full gap-2 pb-1" aria-label="Punteggi">
            {game.players.map((p, i) => (
              <li key={p.id} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm ${i === game.currentPlayerIndex && playing ? 'border-gold-2 bg-gold/15' : 'border-gold/25'}`}>
                <span className="h-3 w-3 rounded-full" style={{ background: p.color }} aria-hidden />
                <span className="max-w-[9rem] truncate">{p.name}</span>
                {p.type === 'bot' ? <span className="text-[0.65rem] uppercase text-sand">BOT</span> : null}
                <b className="text-gold-2" data-testid={`top-score-${p.id}`}>{scores[i].total}</b>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-5 px-3 pb-40 pt-4 sm:px-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {/* Stato del turno */}
          <div className="gn-panel mb-4 p-3" aria-live="polite" data-testid="status">
            {botThinking ? (
              <p className="text-lg" data-testid="bot-thinking">
                <b style={{ color: current.color }}>{current.name}</b> sta decidendo<span className="gn-thinking-dot">...</span>
              </p>
            ) : humanTurn ? (
              <p className="text-lg">
                <b style={{ color: current.color }}>{current.name}</b>, scegli una gang e quante carte prendere dalla destra.
              </p>
            ) : playing ? (
              <p className="text-lg text-sand">Presa in corso…</p>
            ) : (
              <p className="text-lg">La partita è finita: tutte le gang sono state eliminate.</p>
            )}
            {last && lastPlayer ? (
              <p className="mt-1 text-sm text-cream" data-testid="last-move">
                Ultima mossa: <b>{lastPlayer.name}</b> ha preso {last.count} {last.count === 1 ? 'carta' : 'carte'} dalla gang di {getBoss(game.gangs.find((g) => g.id === last.gangId)!.bossId).name}
                {last.bossCaptured ? <b className="text-[#ff8a7a]"> e ha conquistato il Boss!</b> : '.'}
                {settings.showBotReasons && last.botReason ? (
                  <span className="mt-1 block rounded bg-black/30 p-2 italic" data-testid="bot-reason">«{last.botReason}»</span>
                ) : null}
              </p>
            ) : null}
            {lastError ? <p role="alert" className="mt-1 text-sm text-[#ff8a7a]">{lastError}</p> : null}
          </div>

          {ranking ? (
            <div className="mb-6">
              <EndScreen
                game={game}
                ranking={ranking}
                onRematch={() => gameStore.start({ ...game.config, seed: randomSeed(), startingPlayer: ((game.config.startingPlayer ?? 0) + 1) % game.players.length })}
              />
            </div>
          ) : null}

          {/* Tavolo */}
          <div className="gn-felt grid grid-cols-[minmax(0,1fr)] gap-3 p-2 sm:p-3" data-testid="table">
            {game.gangs.map((g) => (
              <GangRow
                key={g.id}
                gang={g}
                selectable={humanTurn && !g.eliminated}
                selected={selection?.gangId === g.id}
                previewCount={selection?.gangId === g.id ? (selection.count ?? 0) : leaving?.gangId === g.id ? leaving.ids.length : 0}
                leavingIds={leaving?.gangId === g.id ? leaving.ids : []}
                capturedBy={g.capturedBy ? game.players.find((p) => p.id === g.capturedBy) ?? null : null}
                onSelect={() => chooseGang(g.id)}
              />
            ))}
          </div>

          {showDebug ? <DebugPanel game={game} scores={scores} botLog={botLog} onClose={() => setDebugHidden(true)} /> : null}
        </div>

        {/* Area giocatori */}
        <aside className="grid content-start gap-3" aria-label="Giocatori">
          {game.players.map((p, i) => (
            <PlayerPanel key={p.id} player={p} score={scores[i]} active={playing && i === game.currentPlayerIndex} defaultOpen={false} />
          ))}
        </aside>
      </main>

      {/* Comandi di presa */}
      {humanTurn && selGang ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/40 bg-ink-2 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]" data-testid="take-controls">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="w-full text-sm text-sand sm:w-auto sm:flex-1">
              Gang di <b className="text-ivory">{getBoss(selGang.bossId).name}</b> · prese consentite: {selLegal.join(', ')}
            </div>
            <div className="gn-seg" role="group" aria-label="Numero di carte da prendere">
              {selLegal.map((n) => (
                <button key={n} type="button" aria-pressed={selection?.count === n} onClick={() => setSel({ turn: game.turn, gangId: selGang.id, count: n })} data-testid={`take-count-${n}`}>
                  {n}
                </button>
              ))}
            </div>
            {selection?.count && selection.count === selGang.henchmen.length ? (
              <p className="w-full text-sm text-[#ff8a7a]" role="status">Attenzione: prenderai l&apos;ultimo Scagnozzo e conquisterai il Boss (malus -{getBoss(selGang.bossId).malus}).</p>
            ) : null}
            <div className="flex w-full gap-2 sm:w-auto">
              <button type="button" className="gn-btn gn-btn--ghost flex-1 sm:flex-none" onClick={() => setSel(null)}>
                <X size={18} /> Annulla
              </button>
              <button type="button" className="gn-btn flex-1 sm:flex-none" disabled={!selection?.count} onClick={() => selection?.count && commit({ gangId: selGang.id, count: selection.count }, current.id)} data-testid="confirm-take">
                <Check size={18} /> {selection?.count ? `Prendi ${selection.count}` : 'Scegli quante'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
