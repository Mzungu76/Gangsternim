'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { COMBOS } from '@/game/catalog';
import { SPECIALIZATION_INFO } from '@/game/data/specializations';
import { describeEffect, TIMING_LABEL } from '@/game/effects';
import { closeCardDetail, useCardDetail } from '@/lib/cardDetail';
import { BossCardView, HenchmanCardView } from './GameCard';

/** Finestra con la carta ingrandita, il testo completo del bonus e le combo. */
export function CardDetailHost() {
  const card = useCardDetail();
  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCardDetail();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card]);
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3" onClick={closeCardDetail} data-testid="card-detail-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Dettagli di ${card.name}`}
        className="gn-panel max-h-[92dvh] w-full max-w-2xl overflow-y-auto p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
        data-testid="card-detail"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="gn-title text-2xl leading-tight">
            {card.name}
            {card.kind === 'boss' ? <span className="gn-type block text-base text-sand">«{card.nickname}»</span> : card.nickname ? <span className="gn-type block text-base text-sand">«{card.nickname}»</span> : null}
          </h2>
          <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" onClick={closeCardDetail} aria-label="Chiudi i dettagli" autoFocus>
            <X size={18} /> Chiudi
          </button>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex justify-center sm:block">
            {card.kind === 'boss' ? <BossCardView card={card} size="lg" /> : <HenchmanCardView card={card} size="lg" />}
          </div>
          <div className="min-w-0 flex-1 text-[0.95rem]">
            {card.kind === 'boss' ? (
              <>
                <p>
                  Presa: <b>{card.minTake === card.maxTake ? `esattamente ${card.minTake}` : `da ${card.minTake} a ${card.maxTake}`}</b> carte per turno.
                </p>
                <p className="mt-1">
                  Malus: <b className="text-[#ff8a7a]">-{card.malus}</b> per chi prende l&apos;ultimo Scagnozzo della fila (e con lui il Boss).
                </p>
                <p className="gn-type mt-3 text-sm text-cream/85">{card.description}</p>
              </>
            ) : (
              (() => {
                const d = describeEffect(card);
                const info = SPECIALIZATION_INFO[card.specialization];
                return (
                  <>
                    <p>
                      Specializzazione: <b>{info.label}</b> · punti base: <b>{card.basePoints}</b>
                    </p>
                    <p className="mt-2">
                      <span className="text-sand">{TIMING_LABEL[d.timing]}{d.bonus ? ` (${d.bonus})` : ''}</span>
                    </p>
                    <p className="mt-1"><span className="text-sand">Condizione:</span> {d.condition}</p>
                    <p className="mt-1"><span className="text-sand">Effetto:</span> {d.text}</p>
                    <h3 className="gn-label mt-4">Come si fanno le combo</h3>
                    <p className="text-sm">
                      {d.timing === 'combo'
                        ? 'Questa carta è un jolly: nelle combo conta come la specializzazione che ti dà più punti.'
                        : `Conta come ${info.label} per le combo: servono più carte della stessa specializzazione (${info.plural}).`}
                    </p>
                    <table className="gn-table mt-2">
                      <tbody>
                        {COMBOS.map((c) => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.size} {info.plural}</td>
                            <td className="text-gold-2">+{c.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="gn-type mt-3 text-sm text-cream/85">{card.flavor}</p>
                  </>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
