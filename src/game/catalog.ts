import { BOSSES } from './data/bosses';
import { HENCHMEN } from './data/henchmen';
import { COMBOS } from './data/combos';
import { SPECIALIZATIONS, type BossCard, type ComboDefinition, type HenchmanCard, type Specialization } from './types';

export { BOSSES, HENCHMEN, COMBOS };

const bossIndex = new Map<string, BossCard>(BOSSES.map((b) => [b.id, b]));
const henchmanIndex = new Map<string, HenchmanCard>(HENCHMEN.map((c) => [c.id, c]));

export function getBoss(id: string): BossCard {
  const b = bossIndex.get(id);
  if (!b) throw new Error(`Boss sconosciuto: ${id}`);
  return b;
}

export function getHenchman(id: string): HenchmanCard {
  const c = henchmanIndex.get(id);
  if (!c) throw new Error(`Scagnozzo sconosciuto: ${id}`);
  return c;
}

export function hasBoss(id: string): boolean {
  return bossIndex.has(id);
}

export function hasHenchman(id: string): boolean {
  return henchmanIndex.has(id);
}

/** Risolve `'self'` nella specializzazione della carta. */
export function resolveSpec(spec: Specialization | 'self', card: HenchmanCard): Specialization {
  return spec === 'self' ? card.specialization : spec;
}

/** Controlla la validità dell'intero catalogo. Restituisce l'elenco degli errori (vuoto = ok). */
export function validateCatalog(
  bosses: readonly BossCard[] = BOSSES,
  henchmen: readonly HenchmanCard[] = HENCHMEN,
  combos: readonly ComboDefinition[] = COMBOS,
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  const specSet = new Set<string>(SPECIALIZATIONS);

  for (const b of bosses) {
    if (ids.has(b.id)) errors.push(`ID duplicato: ${b.id}`);
    ids.add(b.id);
    const key = `boss:${b.name.toLowerCase()}`;
    if (names.has(key)) errors.push(`Nome Boss duplicato: ${b.name}`);
    names.add(key);
    if (!b.name || !b.nickname || !b.description) errors.push(`Boss incompleto: ${b.id}`);
    if (!Number.isInteger(b.minTake) || b.minTake < 1) errors.push(`minTake non valido: ${b.id}`);
    if (!Number.isInteger(b.maxTake) || b.maxTake < b.minTake) errors.push(`maxTake non valido: ${b.id}`);
    if (!Number.isInteger(b.malus) || b.malus < 0) errors.push(`malus non valido: ${b.id}`);
    if (!/^#[0-9a-f]{6}$/i.test(b.color)) errors.push(`colore non valido: ${b.id}`);
    if (b.imageUrl !== null && typeof b.imageUrl !== 'string') errors.push(`imageUrl non valido: ${b.id}`);
  }

  for (const c of henchmen) {
    if (ids.has(c.id)) errors.push(`ID duplicato: ${c.id}`);
    ids.add(c.id);
    const key = `h:${c.name.toLowerCase()}|${(c.nickname ?? '').toLowerCase()}`;
    if (names.has(key)) errors.push(`Scagnozzo duplicato: ${c.name}`);
    names.add(key);
    if (!c.name || !c.flavor) errors.push(`Scagnozzo incompleto: ${c.id}`);
    if (!specSet.has(c.specialization)) errors.push(`Specializzazione non valida: ${c.id}`);
    if (!Number.isInteger(c.basePoints) || c.basePoints < 0) errors.push(`basePoints non valido: ${c.id}`);
    errors.push(...validateEffect(c));
  }

  const comboIds = new Set<string>();
  const comboSizes = new Set<number>();
  for (const k of combos) {
    if (comboIds.has(k.id)) errors.push(`Combo duplicata: ${k.id}`);
    comboIds.add(k.id);
    if (comboSizes.has(k.size)) errors.push(`Dimensione combo duplicata: ${k.size}`);
    comboSizes.add(k.size);
    if (!Number.isInteger(k.size) || k.size < 2) errors.push(`Dimensione combo non valida: ${k.id}`);
    if (!Number.isInteger(k.points) || k.points < 0) errors.push(`Punti combo non validi: ${k.id}`);
  }
  return errors;
}

function validSpecRef(s: unknown): boolean {
  return s === 'self' || (typeof s === 'string' && (SPECIALIZATIONS as readonly string[]).includes(s));
}

function posInt(n: unknown): boolean {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

function validateEffect(c: HenchmanCard): string[] {
  const e = c.effect;
  const err = (m: string) => [`Effetto non valido (${c.id}): ${m}`];
  switch (e.type) {
    case 'none':
    case 'comboWildcard':
      return [];
    case 'withSpec':
      if (!validSpecRef(e.spec) || !posInt(e.minCount) || !Number.isInteger(e.bonus)) return err('withSpec');
      return [];
    case 'perSpecCard':
      if (!validSpecRef(e.spec) || !posInt(e.perCard) || !posInt(e.max)) return err('perSpecCard');
      return [];
    case 'perDistinctSpec':
      if (!posInt(e.perSpec) || !posInt(e.max)) return err('perDistinctSpec');
      return [];
    case 'withoutSpec':
      if (!validSpecRef(e.spec) || e.spec === c.specialization || !Number.isInteger(e.bonus) || e.bonus === 0)
        return err('withoutSpec');
      return [];
    case 'perBoss':
      if (!posInt(e.perBoss) || !posInt(e.max)) return err('perBoss');
      return [];
    case 'noBoss':
      if (!posInt(e.bonus)) return err('noBoss');
      return [];
    case 'malusReduction':
      if (!posInt(e.amount)) return err('malusReduction');
      return [];
    case 'majority':
      if (!validSpecRef(e.spec) || !posInt(e.bonus)) return err('majority');
      return [];
    case 'collectionSize':
      if (!posInt(e.every) || !posInt(e.bonus) || !posInt(e.max)) return err('collectionSize');
      return [];
    case 'captureSize':
      if (!posInt(e.minTaken) || e.minTaken < 2 || !posInt(e.bonus)) return err('captureSize');
      return [];
    case 'lastHenchman':
    case 'firstTake':
      if (!posInt(e.bonus)) return err(e.type);
      return [];
    case 'comboBooster':
      if (!validSpecRef(e.spec) || !posInt(e.minComboSize) || !posInt(e.bonus)) return err('comboBooster');
      return [];
    default: {
      const t: never = e;
      return err(`tipo sconosciuto ${(t as { type: string }).type}`);
    }
  }
}
