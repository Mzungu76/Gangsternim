'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { buildScenario, SCENARIOS } from '@/game/scenarios';
import { gameStore, useGameStore } from '@/lib/gameStore';
import { updateSettings, useSettings } from '@/lib/settingsStore';

export default function DebugPage() {
  const router = useRouter();
  const { game } = useGameStore();
  const settings = useSettings();
  const [json, setJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => gameStore.hydrate(), []);

  const loadState = (state: unknown) => {
    const err = gameStore.load(state as never);
    if (err) {
      setError(err);
      return;
    }
    if (!settings.showDebugPanel) updateSettings({ showDebugPanel: true });
    router.push('/game');
  };

  return (
    <PageShell title="Modalità test">
      <p className="mb-5 max-w-3xl text-cream">
        Carica una situazione di gioco specifica per verificarne il comportamento. Il pannello di debug verrà attivato automaticamente
        (si può nascondere dalla partita o dalle impostazioni).
      </p>
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => (
          <article key={s.id} className="gn-panel flex flex-col p-4">
            <h2 className="font-display text-xl text-gold-2">{s.title}</h2>
            <p className="mt-1 flex-1 text-sm text-cream">{s.description}</p>
            <button type="button" className="gn-btn gn-btn--sm mt-3" onClick={() => loadState(buildScenario(s.spec, s.id))} data-testid={`scenario-${s.id}`}>
              Carica scenario
            </button>
          </article>
        ))}
      </section>
      <section className="gn-panel grid gap-3 p-4">
        <h2 className="gn-title text-2xl">Stato JSON</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" disabled={!game} onClick={() => setJson(JSON.stringify(game, null, 2))}>
            Esporta la partita corrente
          </button>
          <button
            type="button"
            className="gn-btn gn-btn--sm"
            disabled={!json.trim()}
            onClick={() => {
              try {
                loadState(JSON.parse(json));
              } catch {
                setError('JSON non valido.');
              }
            }}
          >
            <Upload size={16} /> Carica lo stato
          </button>
        </div>
        <label htmlFor="state-json" className="gn-label">Stato della partita (GameState)</label>
        <textarea id="state-json" className="gn-input gn-type min-h-64 text-xs" value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
        {error ? <p role="alert" className="text-[#ff8a7a]">{error}</p> : null}
      </section>
    </PageShell>
  );
}
