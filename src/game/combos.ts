import { COMBOS } from './data/combos';
import { SPECIALIZATIONS, type ComboDefinition, type Specialization } from './types';

export interface ComboGroup {
  specialization: Specialization;
  comboId: string;
  name: string;
  size: number;
  points: number;
}

export interface ComboProgress {
  specialization: Specialization;
  /** Carte contate nella specializzazione (jolly inclusi). */
  count: number;
  /** Di cui jolly assegnati. */
  wildcards: number;
  groups: ComboGroup[];
  points: number;
  /** Carte mancanti per aumentare i punti combo (null se non migliorabile). */
  missingForNext: number | null;
  /** Nome della combinazione che si otterrebbe con le carte mancanti. */
  nextComboName: string | null;
}

export interface ComboResult {
  groups: ComboGroup[];
  points: number;
  /** Specializzazione assegnata a ciascun jolly (stesso ordine dei jolly). */
  wildcardAssignment: Specialization[];
  progress: ComboProgress[];
  /** Dimensione massima della combo completata per specializzazione. */
  maxSizeBySpec: Record<Specialization, number>;
}

export function emptySpecRecord(): Record<Specialization, number> {
  const r = {} as Record<Specialization, number>;
  for (const s of SPECIALIZATIONS) r[s] = 0;
  return r;
}

/**
 * Raggruppa `n` carte della stessa specializzazione partendo dalla combinazione
 * più grande. Esempio (default): 5 → Quartetto + 1 singola; 7 → Quartetto + Tris.
 * Ogni carta appartiene al massimo a un gruppo: nessun doppio conteggio.
 */
export function groupCount(n: number, combos: readonly ComboDefinition[] = COMBOS): ComboDefinition[] {
  const sorted = [...combos].sort((a, b) => b.size - a.size);
  const out: ComboDefinition[] = [];
  let rest = n;
  for (const c of sorted) {
    while (rest >= c.size) {
      out.push(c);
      rest -= c.size;
    }
  }
  return out;
}

export function pointsForCount(n: number, combos: readonly ComboDefinition[] = COMBOS): number {
  return groupCount(n, combos).reduce((s, c) => s + c.points, 0);
}

/** Tutte le distribuzioni di `w` jolly tra le specializzazioni (multiinsiemi, ordine deterministico). */
function* wildcardDistributions(w: number, start = 0): Generator<Specialization[]> {
  if (w === 0) {
    yield [];
    return;
  }
  for (let i = start; i < SPECIALIZATIONS.length; i++) {
    for (const rest of wildcardDistributions(w - 1, i)) yield [SPECIALIZATIONS[i], ...rest];
  }
}

/**
 * Calcola le combo di una collezione.
 * @param specCounts carte per specializzazione stampata (jolly ESCLUSI)
 * @param wildcards numero di carte jolly (contano come specializzazione a scelta)
 */
export function computeCombos(
  specCounts: Record<Specialization, number>,
  wildcards = 0,
  combos: readonly ComboDefinition[] = COMBOS,
): ComboResult {
  let bestAssign: Specialization[] = [];
  let bestPoints = -1;
  if (wildcards === 0) {
    bestPoints = SPECIALIZATIONS.reduce((s, sp) => s + pointsForCount(specCounts[sp], combos), 0);
  } else {
    for (const assign of wildcardDistributions(wildcards)) {
      const counts = { ...specCounts };
      for (const s of assign) counts[s]++;
      const p = SPECIALIZATIONS.reduce((s, sp) => s + pointsForCount(counts[sp], combos), 0);
      if (p > bestPoints) {
        bestPoints = p;
        bestAssign = assign;
      }
    }
  }

  const counts = { ...specCounts };
  const wildBySpec = emptySpecRecord();
  for (const s of bestAssign) {
    counts[s]++;
    wildBySpec[s]++;
  }

  const groups: ComboGroup[] = [];
  const progress: ComboProgress[] = [];
  const maxSizeBySpec = emptySpecRecord();
  for (const sp of SPECIALIZATIONS) {
    const n = counts[sp];
    const g = groupCount(n, combos).map((c) => ({
      specialization: sp,
      comboId: c.id,
      name: c.name,
      size: c.size,
      points: c.points,
    }));
    groups.push(...g);
    maxSizeBySpec[sp] = g.reduce((m, x) => Math.max(m, x.size), 0);
    if (n > 0) {
      const pts = pointsForCount(n, combos);
      let missing: number | null = null;
      let nextName: string | null = null;
      const maxSize = Math.max(...combos.map((c) => c.size));
      for (let k = 1; k <= maxSize; k++) {
        if (pointsForCount(n + k, combos) > pts) {
          missing = k;
          const before = groupCount(n, combos).map((c) => c.id);
          const after = groupCount(n + k, combos);
          // nome della combo "nuova" rispetto alla situazione attuale
          const fresh = after.find((c) => {
            const i = before.indexOf(c.id);
            if (i >= 0) {
              before.splice(i, 1);
              return false;
            }
            return true;
          });
          nextName = fresh?.name ?? after[0]?.name ?? null;
          break;
        }
      }
      progress.push({
        specialization: sp,
        count: n,
        wildcards: wildBySpec[sp],
        groups: g,
        points: pts,
        missingForNext: missing,
        nextComboName: nextName,
      });
    }
  }
  return {
    groups,
    points: Math.max(0, bestPoints),
    wildcardAssignment: bestAssign,
    progress,
    maxSizeBySpec,
  };
}
