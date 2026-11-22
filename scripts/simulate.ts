/**
 * Esegue le simulazioni di bilanciamento e scrive BALANCE_REPORT.md.
 * Uso: npm run simulate [-- --games 1000 --seed 2026]
 */
import { writeFileSync } from 'node:fs';
import { DIFFICULTY_LABEL } from '../src/game/bot/botEngine';
import { bossInsights, cardInsights, simulationReportMarkdown } from '../src/game/report';
import { runSimulation, type SimulationConfig, type SimulationResult } from '../src/game/simulation';
import type { BotDifficulty } from '../src/game/types';

const args = process.argv.slice(2);
const arg = (k: string, d: number) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? Number(args[i + 1]) : d;
};
const GAMES = arg('games', 1000);
const SEED = arg('seed', 2026);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'BALANCE_REPORT.md';

const MATCHUPS: { title: string; bots: BotDifficulty[] }[] = [
  { title: 'A. Facile contro Difficile (2 giocatori)', bots: ['easy', 'hard'] },
  { title: 'B. Medio contro Difficile (2 giocatori)', bots: ['medium', 'hard'] },
  { title: 'C. Facile contro Medio (2 giocatori)', bots: ['easy', 'medium'] },
  { title: 'D. Facile, Medio e Difficile (3 giocatori)', bots: ['easy', 'medium', 'hard'] },
  { title: 'E. Facile, Medio, Difficile e Medio (4 giocatori)', bots: ['easy', 'medium', 'hard', 'medium'] },
  { title: 'F. Quattro BOT Medi (4 giocatori, riferimento per carte e Boss)', bots: ['medium', 'medium', 'medium', 'medium'] },
];

const results: { title: string; r: SimulationResult }[] = [];
for (const m of MATCHUPS) {
  const config: SimulationConfig = { bots: m.bots, gangCount: 4, henchmenMin: 4, henchmenMax: 6, games: GAMES, seed: SEED, rotateStart: true };
  const t = Date.now();
  const r = runSimulation(config);
  console.log(`${m.title}: ${r.games} partite in ${((Date.now() - t) / 1000).toFixed(1)} s`);
  for (const [d, v] of Object.entries(r.byDifficulty)) console.log(`   ${DIFFICULTY_LABEL[d as BotDifficulty]}: ${(v.winRate * 100).toFixed(1)}% vittorie, ${v.avgScore.toFixed(1)} punti`);
  results.push({ title: m.title, r });
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const md: string[] = [];
md.push('# BALANCE_REPORT — Gangster Nim');
md.push('');
md.push(`Report generato automaticamente da \`npm run simulate\` il ${new Date().toISOString().slice(0, 10)}. Seed base ${SEED}, ${GAMES} partite per ogni confronto (${GAMES * MATCHUPS.length} partite totali), 4 gang da 4-6 Scagnozzi, giocatore iniziale a rotazione. I numeri sono quelli effettivamente prodotti dalla simulazione: rieseguendo lo script con lo stesso seed si ottengono gli stessi risultati.`);
md.push('');
md.push('Il bilanciamento NON viene modificato automaticamente: questo report serve solo a individuare possibili squilibri.');
md.push('');
md.push('## Confronto tra i livelli di difficoltà');
md.push('');
md.push('| Confronto | ' + ['Facile', 'Medio', 'Difficile'].map((l) => `% vittorie ${l}`).join(' | ') + ' | Punti medi (F / M / D) |');
md.push('|---|---|---|---|---|');
for (const { title, r } of results.slice(0, 5)) {
  const b = r.byDifficulty;
  const cell = (d: string) => (b[d] ? pct(b[d].winRate) : '—');
  const pts = ['easy', 'medium', 'hard'].map((d) => (b[d] ? b[d].avgScore.toFixed(1) : '—')).join(' / ');
  md.push(`| ${title} | ${cell('easy')} | ${cell('medium')} | ${cell('hard')} | ${pts} |`);
}
md.push('');
md.push('Le vittorie ex aequo valgono 1/k per ciascuno dei k vincitori. Con 2 giocatori il valore atteso a parità di forza è 50%, con 3 giocatori 33,3%, con 4 giocatori 25%.');
md.push('');
md.push('## Dettaglio delle simulazioni');
md.push('');
for (const { title, r } of results) md.push(simulationReportMarkdown(r, title));

const ref = results[results.length - 1].r;
const cards = cardInsights(ref);
md.push('## Carte (riferimento: 4 BOT Medi)');
md.push('');
md.push(`Tasso di vittoria di chi possiede la carta a fine partita, confrontato con il valore atteso del 25%. Ogni carta è uscita in circa ${Math.round(cards.reduce((s, c) => s + c.dealt, 0) / cards.length)} partite. Scarti entro ±4 punti percentuali sono compatibili con il rumore statistico di questo campione.`);
md.push('');
md.push('### Le 10 carte più forti');
md.push('');
md.push('| Carta | Uscita | % vittorie possessore | Scarto (p.p.) |');
md.push('|---|---|---|---|');
for (const c of cards.slice(0, 10)) md.push(`| ${c.name} | ${c.dealt} | ${pct(c.ownerWinRate)} | +${(c.delta * 100).toFixed(1)} |`);
md.push('');
md.push('### Le 10 carte più deboli');
md.push('');
md.push('| Carta | Uscita | % vittorie possessore | Scarto (p.p.) |');
md.push('|---|---|---|---|');
for (const c of cards.slice(-10).reverse()) md.push(`| ${c.name} | ${c.dealt} | ${pct(c.ownerWinRate)} | ${(c.delta * 100).toFixed(1)} |`);
md.push('');
md.push('<details><summary>Tutte le carte</summary>');
md.push('');
md.push('| Carta | Uscita | % vittorie possessore | Scarto (p.p.) |');
md.push('|---|---|---|---|');
for (const c of cards) md.push(`| ${c.name} | ${c.dealt} | ${pct(c.ownerWinRate)} | ${(c.delta * 100).toFixed(1)} |`);
md.push('');
md.push('</details>');
md.push('');
md.push('## Boss (riferimento: 4 BOT Medi)');
md.push('');
md.push('| Boss | Malus | Uscito | % vittorie di chi lo conquista | Scarto (p.p.) |');
md.push('|---|---|---|---|---|');
for (const b of bossInsights(ref)) md.push(`| ${b.name} | -${b.malus} | ${b.dealt} | ${pct(b.capturerWinRate)} | ${(b.delta * 100).toFixed(1)} |`);
md.push('');
md.push('<!-- ANALISI -->');
md.push('');
writeFileSync(out, md.join('\n'));
writeFileSync('scripts/.last-simulation.json', JSON.stringify(results.map(({ title, r }) => ({ title, byDifficulty: r.byDifficulty, avgTurns: r.avgTurns, ties: r.ties })), null, 2));
console.log(`Report scritto in ${out}`);
