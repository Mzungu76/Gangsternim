'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Bot, Dices, User, Zap } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { DIFFICULTY_LABEL } from '@/game/bot/botEngine';
import { DEFAULT_CONFIG, LIMITS, PLAYER_COLORS, validateConfig } from '@/game/engine';
import { randomSeed } from '@/game/rng';
import type { BotDifficulty, BotSpeed, GameConfig, PlayerConfig } from '@/game/types';
import { gameStore } from '@/lib/gameStore';
import { updateSettings, useSettings } from '@/lib/settingsStore';
import { loadLastSetup, saveLastSetup } from '@/lib/storage';
import { useIsClient } from '@/lib/useIsClient';

const BOT_NAMES = ['Il Padrino', 'Mamma Rosa', 'Zio Sal', 'Baby Face Tony'];
const SPEED_LABEL: Record<BotSpeed, string> = { fast: 'Rapida (0,5 s)', normal: 'Normale (1,5 s)', slow: 'Lenta (3 s)' };

interface SetupState {
  players: PlayerConfig[];
  gangCount: number;
  henchmenMin: number;
  henchmenMax: number;
  seed: string;
}

const DEFAULT_SETUP: SetupState = {
  players: [
    { name: 'Giocatore 1', type: 'human' },
    { name: 'Il Padrino', type: 'bot', difficulty: 'medium' },
  ],
  gangCount: DEFAULT_CONFIG.gangCount,
  henchmenMin: DEFAULT_CONFIG.henchmenMin,
  henchmenMax: DEFAULT_CONFIG.henchmenMax,
  seed: '',
};

function quickSetup(): SetupState {
  return {
    ...DEFAULT_SETUP,
    players: [
      { name: 'Tu', type: 'human' },
      { name: BOT_NAMES[0], type: 'bot', difficulty: 'medium' },
      { name: BOT_NAMES[1], type: 'bot', difficulty: 'medium' },
      { name: BOT_NAMES[2], type: 'bot', difficulty: 'medium' },
    ],
    seed: '',
  };
}

function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="gn-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={String(o.v)} type="button" aria-pressed={o.v === value} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function initialSetup(): SetupState {
  const last = loadLastSetup<SetupState>();
  if (last && Array.isArray(last.players) && last.players.length >= 2 && last.players.length <= 4) return { ...DEFAULT_SETUP, ...last, seed: '' };
  return DEFAULT_SETUP;
}

export default function SetupPage() {
  const isClient = useIsClient();
  if (!isClient) {
    return (
      <PageShell title="Nuova partita">
        <p className="text-sand">Caricamento…</p>
      </PageShell>
    );
  }
  return <SetupForm />;
}

function SetupForm() {
  const router = useRouter();
  const settings = useSettings();
  const [setup, setSetup] = useState<SetupState>(initialSetup);
  const [errors, setErrors] = useState<string[]>([]);

  const setCount = (n: number) => {
    setSetup((s) => {
      const players = [...s.players];
      while (players.length < n) players.push({ name: BOT_NAMES[players.length] ?? `BOT ${players.length + 1}`, type: 'bot', difficulty: 'medium' });
      return { ...s, players: players.slice(0, n) };
    });
  };
  const setPlayer = (i: number, patch: Partial<PlayerConfig>) =>
    setSetup((s) => ({ ...s, players: s.players.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  const start = (st: SetupState) => {
    const seedNum = st.seed.trim() === '' ? randomSeed() : Number(st.seed);
    const config: GameConfig = {
      players: st.players.map((p) => ({ name: p.name.trim(), type: p.type, ...(p.type === 'bot' ? { difficulty: p.difficulty ?? 'medium' } : {}) })),
      gangCount: st.gangCount,
      henchmenMin: st.henchmenMin,
      henchmenMax: st.henchmenMax,
      seed: Number.isFinite(seedNum) ? Math.abs(Math.floor(seedNum)) : randomSeed(),
    };
    const errs = validateConfig(config);
    if (st.seed.trim() !== '' && !Number.isFinite(Number(st.seed))) errs.push('Il seed deve essere un numero.');
    setErrors(errs);
    if (errs.length) return;
    saveLastSetup({ ...st, seed: '' });
    gameStore.start(config);
    router.push('/game');
  };

  return (
    <PageShell title="Nuova partita">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button type="button" className="gn-btn" onClick={() => start(quickSetup())} data-testid="quick-start">
          <Zap size={18} /> Partita rapida: tu + 3 BOT
        </button>
        <span className="text-sm text-sand">oppure configura la partita qui sotto.</span>
      </div>

      <form
        className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          start(setup);
        }}
      >
        <section className="gn-panel p-4 sm:p-5" aria-labelledby="players-h">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="players-h" className="gn-title text-2xl">Giocatori</h2>
            <Seg label="Numero di giocatori" value={setup.players.length} onChange={setCount} options={[2, 3, 4].map((n) => ({ v: n, l: `${n}` }))} />
          </div>
          <ul className="grid gap-3">
            {setup.players.map((p, i) => (
              <li key={i} className="rounded-xl border border-gold/25 bg-black/25 p-3" data-testid={`player-row-${i}`}>
                <div className="flex flex-wrap items-end gap-3">
                  <span className="mb-2 h-4 w-4 shrink-0 rounded-full border border-black" style={{ background: PLAYER_COLORS[i] }} aria-hidden />
                  <div className="min-w-[10rem] flex-1">
                    <label className="gn-label" htmlFor={`name-${i}`}>Nome giocatore {i + 1}</label>
                    <input id={`name-${i}`} className="gn-input" value={p.name} maxLength={24} onChange={(e) => setPlayer(i, { name: e.target.value })} />
                  </div>
                  <Seg
                    label={`Tipo giocatore ${i + 1}`}
                    value={p.type}
                    onChange={(t) => setPlayer(i, { type: t, difficulty: t === 'bot' ? (p.difficulty ?? 'medium') : undefined })}
                    options={[
                      { v: 'human', l: 'Umano' },
                      { v: 'bot', l: 'BOT' },
                    ]}
                  />
                  {p.type === 'bot' ? (
                    <div>
                      <label className="gn-label" htmlFor={`diff-${i}`}>Difficoltà</label>
                      <select id={`diff-${i}`} className="gn-input" value={p.difficulty ?? 'medium'} onChange={(e) => setPlayer(i, { difficulty: e.target.value as BotDifficulty })}>
                        {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((d) => (
                          <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <span className="mb-2 text-sand" aria-hidden>{p.type === 'bot' ? <Bot size={20} /> : <User size={20} />}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="gn-panel grid content-start gap-5 p-4 sm:p-5" aria-labelledby="table-h">
          <h2 id="table-h" className="gn-title text-2xl">Tavolo</h2>
          <div>
            <span className="gn-label">Numero di gang</span>
            <Seg label="Numero di gang" value={setup.gangCount} onChange={(v) => setSetup((s) => ({ ...s, gangCount: v }))} options={Array.from({ length: LIMITS.maxGangs - LIMITS.minGangs + 1 }, (_, k) => ({ v: k + LIMITS.minGangs, l: `${k + LIMITS.minGangs}` }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="gn-label" htmlFor="hmin">Scagnozzi min</label>
              <select id="hmin" className="gn-input" value={setup.henchmenMin} onChange={(e) => setSetup((s) => ({ ...s, henchmenMin: Number(e.target.value), henchmenMax: Math.max(s.henchmenMax, Number(e.target.value)) }))}>
                {[4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="gn-label" htmlFor="hmax">Scagnozzi max</label>
              <select id="hmax" className="gn-input" value={setup.henchmenMax} onChange={(e) => setSetup((s) => ({ ...s, henchmenMax: Number(e.target.value), henchmenMin: Math.min(s.henchmenMin, Number(e.target.value)) }))}>
                {[4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <span className="gn-label">Velocità dei BOT</span>
            <Seg label="Velocità dei BOT" value={settings.botSpeed} onChange={(v) => updateSettings({ botSpeed: v })} options={(['fast', 'normal', 'slow'] as BotSpeed[]).map((v) => ({ v, l: SPEED_LABEL[v].split(' ')[0] }))} />
            <p className="mt-1 text-xs text-sand">{SPEED_LABEL[settings.botSpeed]}</p>
          </div>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5 accent-[#c9a24a]" checked={settings.showBotReasons} onChange={(e) => updateSettings({ showBotReasons: e.target.checked })} />
            Mostra le motivazioni delle mosse dei BOT
          </label>
          <div>
            <label className="gn-label" htmlFor="seed">Seed (opzionale)</label>
            <div className="flex gap-2">
              <input id="seed" className="gn-input" inputMode="numeric" placeholder="casuale" value={setup.seed} onChange={(e) => setSetup((s) => ({ ...s, seed: e.target.value }))} />
              <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" aria-label="Genera seed casuale" onClick={() => setSetup((s) => ({ ...s, seed: String(randomSeed()) }))}>
                <Dices size={18} />
              </button>
            </div>
            <p className="mt-1 text-xs text-sand">Stesso seed = stessa distribuzione delle carte.</p>
          </div>
        </section>

        {errors.length ? (
          <div role="alert" className="rounded-lg border border-crimson bg-crimson/20 p-3 lg:col-span-2">
            {errors.map((e) => <p key={e}>{e}</p>)}
          </div>
        ) : null}
        <div className="lg:col-span-2">
          <button type="submit" className="gn-btn w-full text-lg sm:w-auto" data-testid="start-game">
            Avvia la partita
          </button>
        </div>
      </form>
    </PageShell>
  );
}
