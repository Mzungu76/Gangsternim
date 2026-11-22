import { resolveSpec } from './catalog';
import { SPECIALIZATION_INFO } from './data/specializations';
import type { EffectTiming, HenchmanCard, HenchmanEffect, Specialization } from './types';

/** Classificazione temporale di ciascun tipo di effetto. */
export function effectTiming(effect: HenchmanEffect): EffectTiming {
  switch (effect.type) {
    case 'none':
      return 'none';
    case 'captureSize':
    case 'lastHenchman':
    case 'firstTake':
      return 'immediate';
    case 'malusReduction':
      return 'permanent';
    case 'comboWildcard':
      return 'combo';
    default:
      return 'conditional';
  }
}

export const TIMING_LABEL: Record<EffectTiming, string> = {
  none: 'Nessun bonus',
  immediate: 'Bonus immediato',
  conditional: 'Bonus condizionato',
  permanent: 'Bonus permanente',
  combo: 'Bonus combo',
};

function specName(spec: Specialization | 'self', card: HenchmanCard, plural = false): string {
  const s = resolveSpec(spec, card);
  return plural ? SPECIALIZATION_INFO[s].plural : SPECIALIZATION_INFO[s].label;
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export interface EffectDescription {
  timing: EffectTiming;
  /** Bonus sintetico (es. "+2", "fino a +6"), null se nessun bonus. */
  bonus: string | null;
  /** Condizione di attivazione. */
  condition: string;
  /** Descrizione dell'effetto. */
  text: string;
}

/**
 * Genera condizione ed effetto a partire dai dati tipizzati: è l'unica fonte
 * dei testi regolamentari mostrati in catalogo e in partita.
 */
export function describeEffect(card: HenchmanCard): EffectDescription {
  const e = card.effect;
  const timing = effectTiming(e);
  switch (e.type) {
    case 'none':
      return { timing, bonus: null, condition: 'Nessuna', text: 'Solo punteggio base.' };
    case 'withSpec': {
      const other = resolveSpec(e.spec, card) === card.specialization ? 'altr' : '';
      const who =
        e.minCount === 1
          ? other
            ? `almeno un altro ${specName(e.spec, card)}`
            : `almeno un ${specName(e.spec, card)}`
          : `almeno ${e.minCount} ${other ? 'altri ' : ''}${specName(e.spec, card, true)}`;
      return {
        timing,
        bonus: signed(e.bonus),
        condition: `Possiedi ${who}.`,
        text: `${signed(e.bonus)} punti se possiedi ${who}.`,
      };
    }
    case 'perSpecCard': {
      const same = resolveSpec(e.spec, card) === card.specialization;
      const what = same ? `ogni altro ${specName(e.spec, card)}` : `ogni ${specName(e.spec, card)}`;
      return {
        timing,
        bonus: `fino a +${e.max}`,
        condition: `Possiedi ${same ? 'altri ' : ''}${specName(e.spec, card, true)}.`,
        text: `+${e.perCard} per ${what} posseduto, massimo +${e.max}.`,
      };
    }
    case 'perDistinctSpec':
      return {
        timing,
        bonus: `fino a +${e.max}`,
        condition: 'Conta le specializzazioni diverse che possiedi (questa inclusa).',
        text: `+${e.perSpec} per ogni diversa specializzazione posseduta, massimo +${e.max}.`,
      };
    case 'withoutSpec':
      return {
        timing,
        bonus: signed(e.bonus),
        condition: `Non possiedi alcun ${specName(e.spec, card)}.`,
        text:
          e.bonus > 0
            ? `+${e.bonus} punti se non possiedi alcun ${specName(e.spec, card)}.`
            : `${e.bonus} punti se non possiedi alcun ${specName(e.spec, card)}.`,
      };
    case 'perBoss':
      return {
        timing,
        bonus: `fino a +${e.max}`,
        condition: 'Hai conquistato almeno un Boss.',
        text: `+${e.perBoss} per ogni Boss conquistato, massimo +${e.max}.`,
      };
    case 'noBoss':
      return {
        timing,
        bonus: signed(e.bonus),
        condition: 'Non hai conquistato alcun Boss.',
        text: `+${e.bonus} punti se non possiedi alcun Boss.`,
      };
    case 'malusReduction':
      return {
        timing,
        bonus: `-${e.amount} malus`,
        condition: 'Hai conquistato almeno un Boss.',
        text: `Riduce di ${e.amount} il malus di un Boss conquistato (mai oltre lo zero).`,
      };
    case 'majority':
      return {
        timing,
        bonus: signed(e.bonus),
        condition: `Hai più ${specName(e.spec, card, true)} di ogni altro giocatore (parità esclusa).`,
        text: `+${e.bonus} punti se possiedi strettamente più ${specName(e.spec, card, true)} di ogni avversario.`,
      };
    case 'collectionSize':
      return {
        timing,
        bonus: `fino a +${e.max}`,
        condition: `Ogni ${e.every} Scagnozzi posseduti (questo incluso).`,
        text: `+${e.bonus} per ogni gruppo di ${e.every} Scagnozzi posseduti, massimo +${e.max}.`,
      };
    case 'captureSize':
      return {
        timing,
        bonus: signed(e.bonus),
        condition: `Conquistato in una presa di almeno ${e.minTaken} carte.`,
        text: `${signed(e.bonus)} punti, registrati al momento della presa, se prelevato insieme ad almeno ${e.minTaken - 1} altre carte.`,
      };
    case 'lastHenchman':
      return {
        timing,
        bonus: signed(e.bonus),
        condition: 'Conquistato come ultimo Scagnozzo della fila (insieme al Boss).',
        text: `${signed(e.bonus)} punti, registrati al momento della presa, se è l'ultimo Scagnozzo della sua gang.`,
      };
    case 'firstTake':
      return {
        timing,
        bonus: signed(e.bonus),
        condition: 'Conquistato nella prima presa effettuata sulla sua gang.',
        text: `${signed(e.bonus)} punti, registrati al momento della presa, se prelevato nella prima presa della gang.`,
      };
    case 'comboWildcard':
      return {
        timing,
        bonus: 'Jolly',
        condition: 'Sempre attivo nel calcolo delle combo.',
        text: 'Nelle combo vale come una specializzazione qualsiasi, scelta automaticamente per massimizzare i punti.',
      };
    case 'comboBooster': {
      const sizeName = e.minComboSize === 2 ? 'una Coppia' : e.minComboSize === 3 ? 'un Tris' : `una combo da ${e.minComboSize}`;
      return {
        timing,
        bonus: signed(e.bonus),
        condition: `Hai completato almeno ${sizeName} di ${specName(e.spec, card, true)}.`,
        text: `${signed(e.bonus)} punti se hai completato almeno ${sizeName} (o superiore) di ${specName(e.spec, card, true)}.`,
      };
    }
    default: {
      const t: never = e;
      throw new Error(`Effetto sconosciuto ${(t as { type: string }).type}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Valutazione
// ---------------------------------------------------------------------------

export interface CaptureContext {
  /** Numero di carte prelevate nella presa. */
  takenCount: number;
  /** True se la presa ha svuotato la gang (Boss conquistato). */
  bossCaptured: boolean;
  /** True se la carta è l'ultimo Scagnozzo della fila (adiacente al Boss). */
  isLastHenchman: boolean;
  /** True se è la prima presa effettuata sulla gang. */
  isFirstTake: boolean;
}

/** Bonus immediato di una carta al momento della conquista (registrato nello stato). */
export function evaluateImmediate(card: HenchmanCard, ctx: CaptureContext): number {
  const e = card.effect;
  switch (e.type) {
    case 'captureSize':
      return ctx.takenCount >= e.minTaken ? e.bonus : 0;
    case 'lastHenchman':
      return ctx.isLastHenchman ? e.bonus : 0;
    case 'firstTake':
      return ctx.isFirstTake ? e.bonus : 0;
    default:
      return 0;
  }
}

export interface CollectionContext {
  /** Conteggio per specializzazione stampata delle carte del giocatore. */
  specCounts: Record<Specialization, number>;
  henchmenCount: number;
  bossCount: number;
  /** Conteggi per specializzazione degli avversari. */
  opponentSpecCounts: Record<Specialization, number>[];
  /** Dimensione massima della combo completata per specializzazione (dopo i jolly). */
  comboMaxSize: Record<Specialization, number>;
}

/** Bonus condizionato di una carta, ricalcolato in modo deterministico dalla collezione. */
export function evaluateConditional(card: HenchmanCard, ctx: CollectionContext): number {
  const e = card.effect;
  switch (e.type) {
    case 'withSpec': {
      const s = resolveSpec(e.spec, card);
      const others = ctx.specCounts[s] - (s === card.specialization ? 1 : 0);
      return others >= e.minCount ? e.bonus : 0;
    }
    case 'perSpecCard': {
      const s = resolveSpec(e.spec, card);
      const others = ctx.specCounts[s] - (s === card.specialization ? 1 : 0);
      return Math.min(e.max, Math.max(0, others) * e.perCard);
    }
    case 'perDistinctSpec': {
      let distinct = 0;
      for (const k of Object.keys(ctx.specCounts) as Specialization[]) if (ctx.specCounts[k] > 0) distinct++;
      return Math.min(e.max, distinct * e.perSpec);
    }
    case 'withoutSpec':
      return ctx.specCounts[e.spec] === 0 ? e.bonus : 0;
    case 'perBoss':
      return Math.min(e.max, ctx.bossCount * e.perBoss);
    case 'noBoss':
      return ctx.bossCount === 0 ? e.bonus : 0;
    case 'majority': {
      const s = resolveSpec(e.spec, card);
      const mine = ctx.specCounts[s];
      const best = ctx.opponentSpecCounts.reduce((m, o) => Math.max(m, o[s]), 0);
      return mine > best ? e.bonus : 0;
    }
    case 'collectionSize':
      return Math.min(e.max, Math.floor(ctx.henchmenCount / e.every) * e.bonus);
    case 'comboBooster': {
      const s = resolveSpec(e.spec, card);
      return ctx.comboMaxSize[s] >= e.minComboSize ? e.bonus : 0;
    }
    default:
      return 0;
  }
}
