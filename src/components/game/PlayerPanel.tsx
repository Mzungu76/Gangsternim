'use client';
import { useState } from 'react';
import { Bot, ChevronDown, Crown, User } from 'lucide-react';
import { DIFFICULTY_LABEL } from '@/game/bot/botEngine';
import { getBoss, getHenchman } from '@/game/catalog';
import type { ScoreBreakdown } from '@/game/scoring';
import type { PlayerState } from '@/game/types';
import { openCardDetail } from '@/lib/cardDetail';
import { BossCardView, HenchmanCardView } from '../cards/GameCard';
import { ActiveBonuses, ComboList, ScoreSummary } from './ScoreDetails';

export function PlayerBadge({ p }: { p: PlayerState }) {
  return p.type === 'bot' ? (
    <span className="inline-flex items-center gap-1 rounded bg-petrol px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wider text-ivory" data-testid="bot-badge">
      <Bot size={13} /> BOT {p.difficulty ? DIFFICULTY_LABEL[p.difficulty] : ''}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded bg-walnut px-1.5 py-0.5 text-[0.7rem] uppercase tracking-wider text-ivory">
      <User size={13} /> Umano
    </span>
  );
}

export function PlayerPanel({ player, score, active, defaultOpen = false }: { player: PlayerState; score: ScoreBreakdown; active: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article
      className={`gn-panel overflow-hidden ${active ? 'ring-2 ring-gold-2' : ''}`}
      style={{ borderLeft: `6px solid ${player.color}` }}
      data-testid={`player-panel-${player.id}`}
      aria-label={`Giocatore ${player.name}`}
    >
      <button type="button" className="flex w-full items-center gap-3 p-3 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-lg font-semibold">{player.name}</span>
            <PlayerBadge p={player} />
          </div>
          <div className="text-xs text-sand">
            {player.henchmen.length} Scagnozzi · {player.bosses.length} Boss · {score.combos.groups.length} combo
          </div>
        </div>
        <span className="text-3xl font-semibold text-gold-2" data-testid={`player-score-${player.id}`}>{score.total}</span>
        <ChevronDown size={20} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open ? (
        <div className="grid gap-4 border-t border-gold/20 p-3">
          <ScoreSummary s={score} />
          <div>
            <h4 className="gn-label">Carte conquistate <span className="normal-case tracking-normal text-sand">(tocca una carta per i dettagli)</span></h4>
            {player.henchmen.length || player.bosses.length ? (
              <div className="gn-scroll-x pb-2">
                <div className="flex w-max gap-1.5">
                  {player.bosses.map((b) => <BossCardView key={b.cardId} card={getBoss(b.cardId)} size="mini" onClick={() => openCardDetail(getBoss(b.cardId))} />)}
                  {player.henchmen.map((c) => <HenchmanCardView key={c.cardId} card={getHenchman(c.cardId)} size="mini" onClick={() => openCardDetail(getHenchman(c.cardId))} />)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-sand">Ancora nessuna.</p>
            )}
          </div>
          {player.bosses.length ? (
            <div>
              <h4 className="gn-label flex items-center gap-1"><Crown size={14} /> Boss ricevuti</h4>
              <ul className="text-sm">
                {score.bosses.map((b) => (
                  <li key={b.bossId}>
                    {getBoss(b.bossId).name}: -{b.malus}
                    {b.reduction ? <span className="text-gold-2"> (ridotto di {b.reduction})</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h4 className="gn-label">Combo (completate e incomplete)</h4>
            <ComboList s={score} />
          </div>
          <div>
            <h4 className="gn-label">Bonus attivi</h4>
            <ActiveBonuses s={score} />
          </div>
        </div>
      ) : null}
    </article>
  );
}
