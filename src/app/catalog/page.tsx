'use client';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { BossCardView, HenchmanCardView } from '@/components/cards/GameCard';
import { PageShell } from '@/components/PageShell';
import { SpecIcon } from '@/components/SpecIcon';
import { BOSSES, COMBOS, HENCHMEN } from '@/game/catalog';
import { SPECIALIZATION_INFO } from '@/game/data/specializations';
import { describeEffect, TIMING_LABEL } from '@/game/effects';
import { SPECIALIZATIONS, type Specialization } from '@/game/types';

type Tab = 'henchmen' | 'bosses' | 'combos';

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function CatalogPage() {
  const [tab, setTab] = useState<Tab>('henchmen');
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState<Specialization | 'all'>('all');

  const henchmen = useMemo(
    () => HENCHMEN.filter((c) => (spec === 'all' || c.specialization === spec) && norm(`${c.name} ${c.nickname ?? ''}`).includes(norm(q))),
    [q, spec],
  );
  const bosses = useMemo(() => BOSSES.filter((b) => norm(`${b.name} ${b.nickname}`).includes(norm(q))), [q]);

  return (
    <PageShell title="Catalogo carte">
      <p className="mb-4 text-cream">
        {BOSSES.length} Boss · {HENCHMEN.length} Scagnozzi · {SPECIALIZATIONS.length} specializzazioni · {COMBOS.length} combo.
        Le illustrazioni arriveranno in futuro: per ora ogni carta mostra un segnaposto.
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="gn-seg" role="tablist" aria-label="Sezione del catalogo">
          {([
            ['henchmen', `Scagnozzi (${HENCHMEN.length})`],
            ['bosses', `Boss (${BOSSES.length})`],
            ['combos', 'Combo'],
          ] as [Tab, string][]).map(([t, l]) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} data-testid={`tab-${t}`}>
              {l}
            </button>
          ))}
        </div>
        {tab !== 'combos' ? (
          <div className="relative min-w-[14rem] flex-1">
            <label htmlFor="search" className="sr-only">Cerca per nome</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sand" size={18} aria-hidden />
            <input id="search" className="gn-input pl-10" placeholder="Cerca per nome o soprannome" value={q} onChange={(e) => setQ(e.target.value)} data-testid="catalog-search" />
          </div>
        ) : null}
      </div>

      {tab === 'henchmen' ? (
        <>
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtro per specializzazione">
            <button type="button" className="gn-btn gn-btn--sm gn-btn--ghost" aria-pressed={spec === 'all'} onClick={() => setSpec('all')} style={spec === 'all' ? { background: 'var(--color-gold)', color: '#140e09' } : undefined}>
              Tutte
            </button>
            {SPECIALIZATIONS.map((s) => (
              <button key={s} type="button" className="gn-btn gn-btn--sm gn-btn--ghost" aria-pressed={spec === s} onClick={() => setSpec(s)} data-testid={`filter-${s}`} style={spec === s ? { background: 'var(--color-gold)', color: '#140e09' } : undefined}>
                <SpecIcon spec={s} size={15} /> {SPECIALIZATION_INFO[s].plural}
              </button>
            ))}
          </div>
          <p className="mb-3 text-sm text-sand" data-testid="catalog-count">{henchmen.length} carte trovate</p>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {henchmen.map((c) => {
              const d = describeEffect(c);
              return (
                <li key={c.id} className="gn-panel flex gap-3 p-3" data-testid="catalog-item">
                  <HenchmanCardView card={c} size="sm" />
                  <div className="min-w-0 flex-1 text-sm">
                    <h3 className="font-display text-lg leading-tight text-gold-2">{c.name}</h3>
                    {c.nickname ? <p className="gn-type text-sand">«{c.nickname}»</p> : null}
                    <p className="mt-1">{SPECIALIZATION_INFO[c.specialization].label} · <b>{c.basePoints} punti</b></p>
                    <p className="mt-1"><span className="text-sand">{TIMING_LABEL[d.timing]}{d.bonus ? `: ${d.bonus}` : ''}</span></p>
                    <p className="mt-1"><span className="text-sand">Condizione:</span> {d.condition}</p>
                    <p className="mt-1"><span className="text-sand">Effetto:</span> {d.text}</p>
                    <p className="gn-type mt-2 text-xs text-cream/80">{c.flavor}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {tab === 'bosses' ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bosses.map((b) => (
            <li key={b.id} className="gn-panel flex gap-3 p-3" data-testid="catalog-boss">
              <BossCardView card={b} size="sm" />
              <div className="min-w-0 flex-1 text-sm">
                <h3 className="font-display text-lg leading-tight text-gold-2">{b.name}</h3>
                <p className="gn-type text-sand">«{b.nickname}»</p>
                <p className="mt-1">Presa: <b>{b.minTake === b.maxTake ? `esattamente ${b.minTake}` : `da ${b.minTake} a ${b.maxTake}`}</b> carte per turno</p>
                <p>Malus: <b className="text-[#ff8a7a]">-{b.malus}</b> per chi prende l&apos;ultimo Scagnozzo</p>
                <p className="gn-type mt-2 text-xs text-cream/80">{b.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === 'combos' ? (
        <section className="gn-panel max-w-2xl p-4">
          <table className="gn-table">
            <thead>
              <tr><th>Combo</th><th>Carte della stessa specializzazione</th><th>Punti</th></tr>
            </thead>
            <tbody>
              {COMBOS.map((c) => (
                <tr key={c.id}><td>{c.name}</td><td>{c.size}</td><td>+{c.points}</td></tr>
              ))}
            </tbody>
          </table>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-cream">
            <li>Una combinazione superiore sostituisce quella inferiore (un Tris non conta anche come Coppia).</li>
            <li>Le carte si raggruppano partendo dalla combo più grande: 5 carte = Quartetto + 1 singola; 6 = Quartetto + Coppia; 7 = Quartetto + Tris; 8 = due Quartetti.</li>
            <li>Ogni carta appartiene al massimo a un gruppo: nessun doppio conteggio.</li>
            <li>I jolly (Il Trasformista, Il Doppiogiochista) contano nelle combo come la specializzazione più vantaggiosa.</li>
            <li>Le combo si ricalcolano automaticamente a ogni presa.</li>
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
