import { Crown } from 'lucide-react';
import { SPECIALIZATION_INFO } from '@/game/data/specializations';
import { describeEffect } from '@/game/effects';
import type { BossCard, HenchmanCard } from '@/game/types';
import { GangsterSilhouette } from '../Silhouette';
import { SpecIcon } from '../SpecIcon';

export type CardSize = 'mini' | 'sm' | 'md' | 'lg';

const WIDTH: Record<CardSize, string> = {
  mini: '64px',
  sm: 'clamp(96px, 26vw, 124px)',
  md: 'clamp(110px, 30vw, 150px)',
  lg: 'clamp(150px, 42vw, 210px)',
};

interface CommonProps {
  size?: CardSize;
  className?: string;
  onClick?: () => void;
  /** Etichetta accessibile aggiuntiva (es. stato sul tavolo). */
  ariaExtra?: string;
  testId?: string;
}

function Art({ imageUrl, alt, boss }: { imageUrl: string | null; alt: string; boss?: boolean }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={alt} loading="lazy" />;
  }
  return (
    <span className="gn-card__placeholder">
      <GangsterSilhouette boss={boss} />
    </span>
  );
}

export function BossCardView({ card, size = 'md', className = '', onClick, ariaExtra, testId }: CommonProps & { card: BossCard }) {
  const range = card.minTake === card.maxTake ? `${card.minTake}` : `${card.minTake}–${card.maxTake}`;
  const label = `Boss ${card.name}, presa ${range} carte, malus meno ${card.malus}${ariaExtra ? `, ${ariaExtra}` : ''}`;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label}
      data-testid={testId}
      className={`gn-card gn-card--boss ${size === 'mini' ? 'gn-card--mini' : ''} ${className}`}
      style={{ '--card-w': WIDTH[size], '--accent': card.color } as React.CSSProperties}
    >
      <span className="gn-card__face">
      <span className="gn-card__head">
        <span className="min-w-0">
          <span className="gn-card__name">{card.name}</span>
          <span className="gn-card__nick">{card.nickname}</span>
        </span>
      </span>
      <span className="gn-card__art">
        <Art imageUrl={card.imageUrl} alt={card.name} boss />
        <span className="gn-card__badge" title="Boss">
          <Crown />
        </span>
      </span>
      <span className="gn-card__foot">
        <span className="gn-card__points" title={`Malus -${card.malus}`}>-{card.malus}</span>
        <span className="gn-card__info">
          Presa {range}
          <small>Boss</small>
        </span>
      </span>
      </span>
    </Tag>
  );
}

export function HenchmanCardView({ card, size = 'md', className = '', onClick, ariaExtra, testId }: CommonProps & { card: HenchmanCard }) {
  const info = SPECIALIZATION_INFO[card.specialization];
  const d = describeEffect(card);
  const label = `${card.name}${card.nickname ? ` detto ${card.nickname}` : ''}, ${info.label}, ${card.basePoints} punti${d.bonus ? `, bonus ${d.bonus}` : ''}${ariaExtra ? `, ${ariaExtra}` : ''}`;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={label}
      title={`${card.name}${card.nickname ? ` «${card.nickname}»` : ''} — ${d.text}`}
      data-testid={testId}
      className={`gn-card ${size === 'mini' ? 'gn-card--mini' : ''} ${className}`}
      style={{ '--card-w': WIDTH[size], '--accent': info.color } as React.CSSProperties}
    >
      <span className="gn-card__face">
      <span className="gn-card__head">
        <span className="min-w-0">
          <span className="gn-card__name">{card.name}</span>
          <span className="gn-card__nick">{card.nickname ? `«${card.nickname}»` : info.label}</span>
        </span>
      </span>
      <span className="gn-card__art">
        <Art imageUrl={card.imageUrl} alt={card.name} />
        <span className="gn-card__badge" title={info.label}>
          <SpecIcon spec={card.specialization} />
        </span>
      </span>
      <span className="gn-card__foot">
        <span className="gn-card__points" title="Punteggio base">{card.basePoints}</span>
        <span className="gn-card__info">
          {d.bonus ?? '—'}
          <small>{info.label}</small>
        </span>
      </span>
      </span>
    </Tag>
  );
}
