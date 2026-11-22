import { describe, expect, it } from 'vitest';
import { BOSSES, COMBOS, HENCHMEN, validateCatalog } from '@/game/catalog';
import { describeEffect } from '@/game/effects';
import { SPECIALIZATIONS } from '@/game/types';

describe('catalogo', () => {
  it('ha almeno 15 Boss e 60 Scagnozzi', () => {
    expect(BOSSES.length).toBeGreaterThanOrEqual(15);
    expect(HENCHMEN.length).toBeGreaterThanOrEqual(60);
  });
  it('è valido: ID univoci, campi completi, effetti validi', () => {
    expect(validateCatalog()).toEqual([]);
  });
  it('rileva errori nei dati', () => {
    const bad = [{ ...BOSSES[0] }, { ...BOSSES[0], maxTake: 0 }];
    const errs = validateCatalog(bad, HENCHMEN, COMBOS);
    expect(errs.some((e) => e.includes('ID duplicato'))).toBe(true);
    expect(errs.some((e) => e.includes('maxTake'))).toBe(true);
  });
  it('distribuisce gli Scagnozzi in modo equilibrato tra le 10 specializzazioni', () => {
    for (const s of SPECIALIZATIONS) expect(HENCHMEN.filter((c) => c.specialization === s).length).toBe(6);
  });
  it('contiene i Boss di esempio con i valori richiesti', () => {
    const by = (n: string) => BOSSES.find((b) => b.name === n)!;
    expect(by('Il Padrino')).toMatchObject({ minTake: 1, maxTake: 4, malus: 5 });
    expect(by('Il Macellaio')).toMatchObject({ minTake: 2, maxTake: 3, malus: 3 });
    expect(by('Il Contabile')).toMatchObject({ minTake: 2, maxTake: 2, malus: 4 });
    expect(by('Il Pazzo')).toMatchObject({ minTake: 1, maxTake: 5, malus: 7 });
    expect(by('Il Professore')).toMatchObject({ minTake: 1, maxTake: 2, malus: 2 });
    expect(by('Il Colonnello')).toMatchObject({ minTake: 2, maxTake: 4, malus: 5 });
    expect(by('Il Fantasma')).toMatchObject({ minTake: 1, maxTake: 3, malus: 4 });
  });
  it('genera una descrizione per ogni effetto e tutte le immagini sono null (placeholder)', () => {
    for (const c of HENCHMEN) {
      const d = describeEffect(c);
      expect(d.text.length).toBeGreaterThan(5);
      expect(d.condition.length).toBeGreaterThan(3);
      expect(c.imageUrl).toBeNull();
    }
    for (const b of BOSSES) expect(b.imageUrl).toBeNull();
  });
  it('ogni tipo di effetto dichiarato è usato almeno da una carta', () => {
    const used = new Set(HENCHMEN.map((c) => c.effect.type));
    for (const t of ['none', 'withSpec', 'perSpecCard', 'perDistinctSpec', 'withoutSpec', 'perBoss', 'noBoss', 'malusReduction', 'majority', 'collectionSize', 'captureSize', 'lastHenchman', 'firstTake', 'comboWildcard', 'comboBooster'])
      expect(used.has(t as never)).toBe(true);
  });
});

describe('testo breve stampato sulla carta', () => {
  it('esiste per ogni Scagnozzo, è breve e cita i numeri dell\'effetto', async () => {
    const { shortEffect } = await import('@/game/effects');
    for (const c of HENCHMEN) {
      const t = shortEffect(c);
      expect(t.length).toBeGreaterThan(8);
      expect(t.length).toBeLessThanOrEqual(62);
    }
    const by = (id: string) => HENCHMEN.find((c) => c.id === id)!;
    expect(shortEffect(by('h-vecchio-scassinatore'))).toBe('+2 se hai un altro Scassinatore');
    expect(shortEffect(by('h-autista'))).toBe('+3 se hai un altro Autista');
    expect(shortEffect(by('h-informatore'))).toContain('+2 per ogni specializzazione diversa');
    expect(shortEffect(by('h-avvocato'))).toBe('Riduce di 2 il malus di un Boss');
  });
});
