/** Genera CARDS_CATALOG.md direttamente dai dati del catalogo (fonte unica). */
import { writeFileSync } from 'node:fs';
import { BOSSES, COMBOS, HENCHMEN } from '../src/game/catalog';
import { SPECIALIZATION_INFO } from '../src/game/data/specializations';
import { describeEffect, TIMING_LABEL } from '../src/game/effects';
import { SPECIALIZATIONS } from '../src/game/types';

const md: string[] = [];
const esc = (s: string) => s.replace(/\|/g, '\\|');
md.push('# CARDS_CATALOG — Gangster Nim');
md.push('');
md.push(`Generato da \`npm run catalog:md\` a partire da \`src/game/data/\`. Totale: **${BOSSES.length} Boss** e **${HENCHMEN.length} Scagnozzi** (${HENCHMEN.length / SPECIALIZATIONS.length} per ciascuna delle ${SPECIALIZATIONS.length} specializzazioni). Le condizioni e gli effetti sono generati dagli stessi dati tipizzati interpretati dal motore.`);
md.push('');
md.push('Tutte le carte hanno `imageUrl: null`: l\'interfaccia mostra un segnaposto grafico finché non verranno aggiunte le illustrazioni.');
md.push('');
md.push('## Boss');
md.push('');
md.push('| ID | Nome | Soprannome | Presa | Malus | Colore | Descrizione |');
md.push('|---|---|---|---|---|---|---|');
for (const b of BOSSES) {
  md.push(`| \`${b.id}\` | ${b.name} | ${b.nickname} | ${b.minTake === b.maxTake ? `esattamente ${b.minTake}` : `${b.minTake}–${b.maxTake}`} | -${b.malus} | \`${b.color}\` | ${esc(b.description)} |`);
}
md.push('');
md.push('## Scagnozzi');
for (const s of SPECIALIZATIONS) {
  md.push('');
  md.push(`### ${SPECIALIZATION_INFO[s].plural}`);
  md.push('');
  md.push('| ID | Nome | Soprannome | Punti | Bonus | Tipo | Condizione | Effetto |');
  md.push('|---|---|---|---|---|---|---|---|');
  for (const c of HENCHMEN.filter((x) => x.specialization === s)) {
    const d = describeEffect(c);
    md.push(`| \`${c.id}\` | ${c.name} | ${c.nickname ?? '—'} | ${c.basePoints} | ${d.bonus ?? '—'} | ${TIMING_LABEL[d.timing]} | ${esc(d.condition)} | ${esc(d.text)} |`);
  }
}
md.push('');
md.push('## Combo');
md.push('');
md.push('| ID | Nome | Carte della stessa specializzazione | Punti |');
md.push('|---|---|---|---|');
for (const c of COMBOS) md.push(`| \`${c.id}\` | ${c.name} | ${c.size} | +${c.points} |`);
md.push('');
md.push('Raggruppamento dal più grande: 5 = Quartetto + 1 singola, 6 = Quartetto + Coppia, 7 = Quartetto + Tris, 8 = due Quartetti. I jolly (`comboWildcard`) vengono assegnati alla specializzazione che massimizza i punti combo.');
md.push('');
md.push('## Come aggiungere carte');
md.push('');
md.push('1. Aggiungere la voce in `src/game/data/bosses.ts` o `src/game/data/henchmen.ts` (ID univoco, `imageUrl` opzionale).');
md.push('2. Usare uno dei tipi di effetto definiti in `src/game/types.ts` (`HenchmanEffect`). Per un effetto nuovo: aggiungere il tipo, la descrizione in `describeEffect`, la valutazione in `evaluateImmediate`/`evaluateConditional` e la validazione in `catalog.ts`.');
md.push('3. Eseguire `npm test` (la validazione del catalogo controlla ID, campi e parametri) e `npm run catalog:md`.');
md.push('');
writeFileSync('CARDS_CATALOG.md', md.join('\n'));
console.log('CARDS_CATALOG.md scritto');
