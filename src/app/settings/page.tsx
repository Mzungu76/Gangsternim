'use client';
import { useEffect, useState } from 'react';
import { PageShell } from '@/components/PageShell';
import type { BotSpeed } from '@/game/types';
import { gameStore, useGameStore } from '@/lib/gameStore';
import { updateSettings, useSettings } from '@/lib/settingsStore';
import { clearHistory, useHistory } from '@/lib/historyStore';

export default function SettingsPage() {
  const s = useSettings();
  const { game } = useGameStore();
  const historyCount = useHistory()?.length ?? 0;
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => gameStore.hydrate(), []);

  const toggle = (key: 'showBotReasons' | 'showDebugPanel' | 'animations', label: string, help: string) => (
    <label className="flex items-start gap-3">
      <input type="checkbox" className="mt-1 h-5 w-5 accent-[#c9a24a]" checked={s[key]} onChange={(e) => updateSettings({ [key]: e.target.checked })} data-testid={`setting-${key}`} />
      <span>
        {label}
        <span className="block text-sm text-sand">{help}</span>
      </span>
    </label>
  );

  return (
    <PageShell title="Impostazioni">
      <div className="grid max-w-2xl gap-5">
        <section className="gn-panel grid gap-4 p-4">
          <h2 className="gn-title text-2xl">Partita</h2>
          <div>
            <span className="gn-label">Velocità dei BOT</span>
            <div className="gn-seg" role="group" aria-label="Velocità dei BOT">
              {([
                ['fast', 'Rapida 0,5 s'],
                ['normal', 'Normale 1,5 s'],
                ['slow', 'Lenta 3 s'],
              ] as [BotSpeed, string][]).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={s.botSpeed === v} onClick={() => updateSettings({ botSpeed: v })}>{l}</button>
              ))}
            </div>
          </div>
          {toggle('showBotReasons', 'Mostra le motivazioni dei BOT', 'Spiegazione della mossa prodotta dal motore decisionale.')}
          {toggle('animations', 'Animazioni', 'Breve animazione durante la presa delle carte.')}
          {toggle('showDebugPanel', 'Pannello di debug', 'Mostra lo stato interno della partita e le decisioni dei BOT (per sviluppo e test).')}
        </section>
        <section className="gn-panel grid gap-3 p-4">
          <h2 className="gn-title text-2xl">Dati salvati</h2>
          <p className="text-sm text-sand">Tutto resta nel tuo browser (LocalStorage): nessun server, nessun account.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="gn-btn gn-btn--danger"
              disabled={!game || game.status !== 'playing'}
              onClick={() => {
                if (confirm('Abbandonare la partita in corso? Non potrà essere ripresa.')) {
                  gameStore.abandon();
                  setMsg('Partita in corso eliminata.');
                }
              }}
            >
              Elimina la partita in corso
            </button>
            <button
              type="button"
              className="gn-btn gn-btn--danger"
              disabled={historyCount === 0}
              onClick={() => {
                if (confirm(`Cancellare lo storico di ${historyCount} partite?`)) {
                  clearHistory();
                  setMsg('Storico cancellato.');
                }
              }}
            >
              Cancella lo storico ({historyCount})
            </button>
          </div>
          {msg ? <p role="status" className="text-gold-2">{msg}</p> : null}
        </section>
      </div>
    </PageShell>
  );
}
