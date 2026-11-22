import { DIFFICULTY_LABEL } from './bot/botEngine';
import { getBoss } from './catalog';
import { scoreHistogram, type SimulationResult } from './simulation';

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;
const f1 = (x: number) => x.toFixed(2);

export interface CardInsight {
  id: string;
  name: string;
  dealt: number;
  /** Tasso di vittoria di chi possedeva la carta a fine partita. */
  ownerWinRate: number;
  /** Differenza rispetto al tasso di vittoria atteso (1 / numero giocatori). */
  delta: number;
}

export function cardInsights(r: SimulationResult): CardInsight[] {
  const base = 1 / r.config.bots.length;
  return r.cards
    .filter((c) => c.dealt > 0)
    .map((c) => ({ id: c.id, name: c.name, dealt: c.dealt, ownerWinRate: c.ownerWins / c.dealt, delta: c.ownerWins / c.dealt - base }))
    .sort((a, b) => b.delta - a.delta);
}

export function bossInsights(r: SimulationResult) {
  const base = 1 / r.config.bots.length;
  return r.bosses
    .filter((b) => b.captured > 0)
    .map((b) => ({ id: b.id, name: b.name, malus: getBoss(b.id).malus, dealt: b.dealt, capturerWinRate: b.capturerWins / b.captured, delta: b.capturerWins / b.captured - base }))
    .sort((a, b) => a.delta - b.delta);
}

/** Report Markdown di una simulazione (usato dalla CLI e dalla pagina Simulazione). */
export function simulationReportMarkdown(r: SimulationResult, title = 'Simulazione'): string {
  const lines: string[] = [];
  const c = r.config;
  lines.push(`### ${title}`);
  lines.push('');
  lines.push(`- BOT: ${c.bots.map((b) => DIFFICULTY_LABEL[b]).join(', ')} · gang: ${c.gangCount} · Scagnozzi per gang: ${c.henchmenMin}-${c.henchmenMax}`);
  lines.push(`- Partite: ${r.games} · seed: ${c.seed} · giocatore iniziale a rotazione: ${c.rotateStart === false ? 'no' : 'sì'}`);
  lines.push(`- Durata media: ${f1(r.avgTurns)} turni · partite con vittoria ex aequo: ${r.ties} · tempo di calcolo: ${(r.durationMs / 1000).toFixed(1)} s`);
  lines.push('');
  lines.push('| Posto | BOT | % vittorie | Punti medi | Boss medi | Malus netto medio | Bonus medi | Punti combo medi | Coppie | Tris | Quartetti |');
  lines.push('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const s of r.seats) {
    const g = r.games;
    lines.push(
      `| ${s.seat + 1} | ${DIFFICULTY_LABEL[s.difficulty]} | ${pct(s.weightedWins / g)} | ${f1(s.totalScore / g)} | ${f1(s.bosses / g)} | ${f1(s.malusNet / g)} | ${f1(s.bonus / g)} | ${f1(s.comboPoints / g)} | ${f1((s.combos['Coppia'] ?? 0) / g)} | ${f1((s.combos['Tris'] ?? 0) / g)} | ${f1((s.combos['Quartetto'] ?? 0) / g)} |`,
    );
  }
  lines.push('');
  lines.push('Distribuzione dei punteggi (intervalli di 5 punti):');
  lines.push('');
  for (const s of r.seats) {
    const h = scoreHistogram(s.scores, 5).map((b) => `${b.from}…${b.to}: ${b.count}`).join(' · ');
    lines.push(`- Posto ${s.seat + 1} (${DIFFICULTY_LABEL[s.difficulty]}): ${h}`);
  }
  lines.push('');
  return lines.join('\n');
}
