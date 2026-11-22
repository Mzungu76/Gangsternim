import { getBoss, getHenchman } from '@/game/catalog';
import { SPECIALIZATION_INFO } from '@/game/data/specializations';
import type { ScoreBreakdown } from '@/game/scoring';

export function ScoreSummary({ s }: { s: ScoreBreakdown }) {
  const rows: [string, number, string?][] = [
    ['Punteggio base', s.base],
    ['Bonus immediati', s.immediate],
    ['Bonus condizionati', s.conditional],
    ['Bonus combo', s.combo],
    ['Malus Boss', -s.malusGross, 'text-[#ff8a7a]'],
    ['Riduzione malus', s.malusReduction],
  ];
  return (
    <table className="gn-table">
      <tbody>
        {rows.map(([l, v, c]) => (
          <tr key={l}>
            <td>{l}</td>
            <td className={c}>{v > 0 ? `+${v}` : v}</td>
          </tr>
        ))}
        <tr className="font-semibold text-gold-2">
          <td>Totale</td>
          <td data-testid="score-total">{s.total}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function ActiveBonuses({ s }: { s: ScoreBreakdown }) {
  const lines = s.lines.filter((l) => l.category === 'immediate' || l.category === 'conditional' || l.category === 'permanent');
  if (!lines.length) return <p className="text-sm text-sand">Nessun bonus attivo.</p>;
  const cat = { immediate: 'Immediato', conditional: 'Condizionato', permanent: 'Permanente' } as Record<string, string>;
  return (
    <ul className="grid gap-1 text-sm">
      {lines.map((l, i) => {
        const name = l.cardId ? (l.cardId.startsWith('boss-') ? getBoss(l.cardId).name : getHenchman(l.cardId).name) : '';
        return (
          <li key={i} className="flex justify-between gap-2">
            <span>
              <b>{name}</b> <span className="text-sand">({cat[l.category]})</span>
              <span className="block text-xs text-cream/80">{l.label}</span>
            </span>
            <span className={l.points < 0 ? 'text-[#ff8a7a]' : 'text-gold-2'}>{l.category === 'permanent' ? `+${l.points}` : l.points > 0 ? `+${l.points}` : l.points}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ComboList({ s }: { s: ScoreBreakdown }) {
  const progress = s.combos.progress;
  if (!progress.length) return <p className="text-sm text-sand">Nessuna carta ancora.</p>;
  return (
    <ul className="grid gap-1 text-sm" data-testid="combo-list">
      {progress.map((p) => (
        <li key={p.specialization} className="flex justify-between gap-2">
          <span>
            {SPECIALIZATION_INFO[p.specialization].plural}: <b>{p.count}</b>
            {p.wildcards ? <span className="text-sand"> (di cui {p.wildcards} jolly)</span> : null}
            <span className="block text-xs text-cream/80">
              {p.groups.length ? `Completate: ${p.groups.map((g) => g.name).join(' + ')}` : 'Nessuna combo completata'}
              {p.missingForNext ? ` · mancano ${p.missingForNext} per ${p.nextComboName}` : ''}
            </span>
          </span>
          <span className="text-gold-2">{p.points ? `+${p.points}` : '0'}</span>
        </li>
      ))}
    </ul>
  );
}
