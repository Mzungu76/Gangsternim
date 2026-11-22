import { Skull } from 'lucide-react';
import { getBoss, getHenchman } from '@/game/catalog';
import { legalTakeCounts } from '@/game/gangs';
import type { GangState, PlayerState } from '@/game/types';
import { BossCardView, HenchmanCardView } from '../cards/GameCard';

interface Props {
  gang: GangState;
  selectable: boolean;
  selected: boolean;
  /** Numero di carte evidenziate (anteprima della presa). */
  previewCount: number;
  leavingIds: string[];
  capturedBy: PlayerState | null;
  onSelect: () => void;
}

export function GangRow({ gang, selectable, selected, previewCount, leavingIds, capturedBy, onSelect }: Props) {
  const boss = getBoss(gang.bossId);
  const legal = legalTakeCounts(gang);
  const remaining = gang.henchmen.length;
  const range = boss.minTake === boss.maxTake ? `esattamente ${boss.minTake}` : `da ${boss.minTake} a ${boss.maxTake}`;
  const targetStart = remaining - previewCount;
  const capturesBoss = previewCount > 0 && previewCount === remaining;

  return (
    <section
      className={`min-w-0 rounded-2xl border p-2 transition-colors sm:p-3 ${selected ? 'border-gold-2 bg-gold/10' : 'border-gold/20 bg-black/20'} ${gang.eliminated ? 'opacity-60' : ''}`}
      aria-label={`Gang di ${boss.name}`}
      data-testid={`gang-${gang.id}`}
      data-remaining={remaining}
    >
      <header className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-sm">
        <span className="font-display text-lg text-gold-2">{boss.name}</span>
        {gang.eliminated ? (
          <span className="inline-flex items-center gap-1 rounded bg-crimson/40 px-2 py-0.5 text-xs uppercase tracking-wider">
            <Skull size={14} /> Eliminata{capturedBy ? ` — Boss a ${capturedBy.name}` : ''}
          </span>
        ) : (
          <>
            <span className="rounded bg-black/40 px-2 py-0.5">Presa: <b>{range}</b></span>
            <span className="rounded bg-black/40 px-2 py-0.5">Malus: <b className="text-[#ff8a7a]">-{boss.malus}</b></span>
            <span className="rounded bg-black/40 px-2 py-0.5">{remaining} {remaining === 1 ? 'carta' : 'carte'}</span>
            {remaining < boss.minTake ? <span className="rounded bg-crimson/40 px-2 py-0.5">Obbligo: prendere tutte le carte</span> : null}
          </>
        )}
        {!gang.eliminated && selectable ? (
          <button type="button" onClick={onSelect} className="gn-btn gn-btn--sm ml-auto" aria-pressed={selected} data-testid={`select-${gang.id}`}>
            {selected ? 'Selezionata' : `Scegli (${legal.join(', ')})`}
          </button>
        ) : null}
      </header>
      <div className="gn-scroll-x -mx-1 px-1 pb-2 pt-3">
        <div className="flex w-max items-end gap-2 sm:gap-3">
          <BossCardView
            card={boss}
            size="sm"
            className={capturesBoss ? 'is-boss-risk' : ''}
            onClick={selectable && !gang.eliminated ? onSelect : undefined}
            ariaExtra={selectable ? 'seleziona questa gang' : undefined}
          />
          <span className="mx-0.5 h-24 w-px self-center bg-gold/30" aria-hidden />
          {gang.henchmen.map((id, i) => {
            const target = previewCount > 0 && i >= targetStart;
            return (
              <HenchmanCardView
                key={id}
                card={getHenchman(id)}
                size="sm"
                testId={`card-${id}`}
                onClick={selectable ? onSelect : undefined}
                ariaExtra={target ? 'verrà prelevata' : undefined}
                className={`${target ? 'is-target' : ''} ${leavingIds.includes(id) ? 'is-leaving' : ''}`}
              />
            );
          })}
          {gang.henchmen.length === 0 ? <p className="px-2 py-6 text-sm text-sand">Nessuno Scagnozzo rimasto.</p> : null}
        </div>
      </div>
    </section>
  );
}
