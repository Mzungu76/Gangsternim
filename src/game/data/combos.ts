import type { ComboDefinition } from '../types';

/**
 * Combinazioni per specializzazione. Per aggiungere una nuova combo basta
 * aggiungere una voce: il motore (combos.ts) raggruppa le carte partendo dalla
 * combinazione più grande, senza conoscere i singoli valori.
 */
export const COMBOS: readonly ComboDefinition[] = [
  { id: 'coppia', name: 'Coppia', size: 2, points: 2 },
  { id: 'tris', name: 'Tris', size: 3, points: 5 },
  { id: 'quartetto', name: 'Quartetto', size: 4, points: 9 },
];
