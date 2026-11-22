import { describe, expect, it } from 'vitest';
import { applyMove } from '@/game/engine';
import { computeScore } from '@/game/scoring';
import { makeState } from './helpers';

function score(henchmen: string[], bosses: string[] = [], others: string[][] = [[]], immediate: Record<string, number> = {}) {
  const s = makeState({
    gangs: [{ bossId: 'boss-padrino', henchmen: [] }, { bossId: 'boss-macellaio', henchmen: [] }],
    players: [{ henchmen, bosses, immediate }, ...others.map((o) => ({ henchmen: o }))],
  });
  return computeScore(s.players[0], s.players);
}

describe('punteggio', () => {
  it('punti base', () => {
    const sc = score(['h-picchiatore', 'h-cecchino']);
    expect(sc.base).toBe(7);
    expect(sc.total).toBe(7);
  });
  it('bonus condizionato (+2 se possiedi un altro Scassinatore) e coppia', () => {
    const sc = score(['h-vecchio-scassinatore', 'h-lina-velluto']);
    expect(sc.base).toBe(5);
    expect(sc.conditional).toBe(2);
    expect(sc.combo).toBe(2);
    expect(sc.total).toBe(9);
    expect(score(['h-vecchio-scassinatore']).conditional).toBe(0);
  });
  it('Informatore: +2 per specializzazione diversa, massimo +6', () => {
    expect(score(['h-informatore']).conditional).toBe(2);
    expect(score(['h-informatore', 'h-picchiatore']).conditional).toBe(4);
    expect(score(['h-informatore', 'h-picchiatore', 'h-cecchino', 'h-esattore', 'h-lina-velluto']).conditional).toBe(6);
  });
  it('bonus individuali di vario tipo', () => {
    expect(score(['h-gigi-nocche', 'h-picchiatore', 'h-bruno-martello']).conditional).toBe(2 + 2); // gigi +2, bruno +2
    expect(score(['h-canarino']).conditional).toBe(-3);
    expect(score(['h-canarino', 'h-avv-sbarra']).conditional).toBe(0);
    expect(score(['h-toto-fuggiasco']).conditional).toBe(3);
    expect(score(['h-toto-fuggiasco'], ['boss-cuoco']).conditional).toBe(0);
    expect(score(['h-salvo-tommy'], ['boss-cuoco', 'boss-professore', 'boss-sarto']).conditional).toBe(4);
    expect(score(['h-ugo-carburatore', 'h-picchiatore', 'h-cecchino', 'h-esattore']).conditional).toBe(1);
    expect(score(['h-dino-silenziatore']).conditional).toBe(2);
    expect(score(['h-dino-silenziatore', 'h-informatore']).conditional).toBe(4 - 2 + 2); // dino 0, informatore +4
  });
  it('maggioranza: solo se strettamente superiore a ogni avversario', () => {
    expect(score(['h-rocco-zuppa', 'h-picchiatore'], [], [['h-bruno-martello']]).conditional).toBe(3);
    expect(score(['h-rocco-zuppa'], [], [['h-bruno-martello']]).conditional).toBe(0);
  });
  it('jolly e potenziatore di combo', () => {
    const sc = score(['h-trasformista', 'h-lina-velluto']);
    expect(sc.combo).toBe(2);
    expect(score(['h-peppe-topo', 'h-lina-velluto', 'h-orecchio-fino']).conditional).toBe(4);
    expect(score(['h-peppe-topo', 'h-lina-velluto']).conditional).toBe(0);
  });
  it('malus e riduzione dei malus (mai trasformata in bonus)', () => {
    const sc = score(['h-avvocato'], ['boss-pazzo']);
    expect(sc.malusGross).toBe(7);
    expect(sc.malusReduction).toBe(2);
    expect(sc.total).toBe(2 - 5);
    const sc2 = score(['h-principe-foro'], ['boss-professore']);
    expect(sc2.malusReduction).toBe(2);
    expect(sc2.malusNet).toBe(0);
    expect(sc2.total).toBe(1);
    const sc3 = score(['h-principe-foro', 'h-avvocato'], ['boss-pazzo', 'boss-professore']);
    expect(sc3.malusReduction).toBe(6);
    expect(sc3.malusNet).toBe(3);
    const sc4 = score(['h-principe-foro', 'h-avvocato'], ['boss-pazzo']);
    expect(sc4.malusReduction).toBe(4); // un Avvocato per Boss
    expect(score(['h-avvocato']).malusReduction).toBe(0);
  });
  it('bonus immediati registrati alla presa', () => {
    const s = makeState({
      gangs: [
        { bossId: 'boss-padrino', henchmen: ['h-gina-falco', 'h-picchiatore', 'h-cecchino', 'h-tano-bisonte'] },
        { bossId: 'boss-fantasma', henchmen: ['h-esattore', 'h-pina-lingua'] },
      ],
    });
    let r = applyMove(s, { gangId: 'gang-1', count: 3 }); // tano in presa da 3 → +2
    const tano = r.state.players[0].henchmen.find((c) => c.cardId === 'h-tano-bisonte')!;
    expect(tano.immediateBonus).toBe(2);
    r = applyMove(r.state, { gangId: 'gang-2', count: 1 }); // p2 prima presa → Pina +2
    expect(r.state.players[1].henchmen[0]).toMatchObject({ cardId: 'h-pina-lingua', immediateBonus: 2 });
    r = applyMove(r.state, { gangId: 'gang-1', count: 1 }); // p1 prende Gina come ultima → +3
    expect(r.state.players[0].henchmen.find((c) => c.cardId === 'h-gina-falco')!.immediateBonus).toBe(3);
    const sc = computeScore(r.state.players[0], r.state.players);
    expect(sc.immediate).toBe(5);
  });
  it('nessun doppio conteggio: il calcolo è deterministico e idempotente', () => {
    const s = makeState({
      gangs: [{ bossId: 'boss-padrino', henchmen: [] }, { bossId: 'boss-macellaio', henchmen: [] }],
      players: [{ henchmen: ['h-vecchio-scassinatore', 'h-lina-velluto', 'h-avvocato'], bosses: ['boss-pazzo'], immediate: { 'h-lina-velluto': 0 } }, {}],
    });
    const a = computeScore(s.players[0], s.players);
    const b = computeScore(s.players[0], s.players);
    expect(a).toEqual(b);
    expect(a.total).toBe(a.base + a.immediate + a.conditional + a.combo - a.malusNet);
    const sumLines = a.lines.reduce((x, l) => x + l.points, 0);
    // le righe riportano bonus, combo, riduzioni e malus: base esclusa
    expect(sumLines + a.base).toBe(a.total);
  });
});
