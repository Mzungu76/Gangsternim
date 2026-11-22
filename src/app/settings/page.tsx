'use client';
import { useEffect, useState } from 'react';
import { ConfirmButton } from '@/components/ConfirmButton';
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
            <ConfirmButton
              label="Elimina la partita in corso"
              confirmLabel="Sì, elimina la partita"
              disabled={!game || game.status !== 'playing'}
              onConfirm={() => {
                gameStore.abandon();
                setMsg('Partita in corso eliminata.');
              }}
            />
            <ConfirmButton
              label={`Cancella lo storico (${historyCount})`}
              confirmLabel="Sì, cancella lo storico"
              disabled={historyCount === 0}
              onConfirm={() => {
                clearHistory();
                setMsg('Storico cancellato.');
              }}
            />
          </div>
          {msg ? <p role="status" className="text-gold-2">{msg}</p> : null}
        </section>
      </div>
    </PageShell>
  );
}
