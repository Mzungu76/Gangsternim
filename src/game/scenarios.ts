/**
 * Scenari predefiniti per la modalità test: permettono di verificare singole
 * situazioni di gioco caricandole direttamente sul tavolo.
 */
import { createGame } from './engine';
import type { BotDifficulty, GameState, GangState, PlayerState } from './types';

export interface ScenarioSpec {
  gangs: { bossId: string; henchmen: string[] }[];
  players: { name: string; type: 'human' | 'bot'; difficulty?: BotDifficulty; henchmen?: string[]; bosses?: string[] }[];
}

export function buildScenario(spec: ScenarioSpec, id = 'scenario'): GameState {
  const base = createGame(
    { players: spec.players.map((p) => ({ name: p.name, type: p.type, difficulty: p.difficulty })), gangCount: 2, henchmenMin: 4, henchmenMax: 4, seed: 1 },
    { id: `${id}-${Date.now().toString(36)}` },
  );
  const gangs: GangState[] = spec.gangs.map((g, i) => ({
    id: `gang-${i + 1}`,
    bossId: g.bossId,
    henchmen: [...g.henchmen],
    initialSize: g.henchmen.length,
    takes: 0,
    eliminated: g.henchmen.length === 0,
    capturedBy: null,
  }));
  const players: PlayerState[] = base.players.map((p, i) => ({
    ...p,
    henchmen: (spec.players[i].henchmen ?? []).map((cardId) => ({ cardId, turn: 0, gangId: 'scenario', immediateBonus: 0 })),
    bosses: (spec.players[i].bosses ?? []).map((cardId) => ({ cardId, turn: 0, gangId: 'scenario' })),
  }));
  return { ...base, gangs, players };
}

export const SCENARIOS: { id: string; title: string; description: string; spec: ScenarioSpec }[] = [
  {
    id: 'boss-obbligato',
    title: 'Boss obbligato',
    description: 'Restano solo file con meno carte del minimo: chiunque giochi deve conquistare un Boss. Quale conviene?',
    spec: {
      gangs: [
        { bossId: 'boss-contabile', henchmen: ['h-cecchino'] },
        { bossId: 'boss-notaio', henchmen: ['h-picchiatore', 'h-esattore'] },
        { bossId: 'boss-pazzo', henchmen: [] },
      ],
      players: [{ name: 'Tu', type: 'human' }, { name: 'Il Padrino', type: 'bot', difficulty: 'hard' }],
    },
  },
  {
    id: 'combo-vicina',
    title: 'Combo a un passo',
    description: 'Hai due Scassinatori: in fondo alla fila del Padrino ce n\'è un terzo. Il Tris vale +5.',
    spec: {
      gangs: [
        { bossId: 'boss-padrino', henchmen: ['h-esattore', 'h-gatto-nero', 'h-cecchino', 'h-orecchio-fino'] },
        { bossId: 'boss-macellaio', henchmen: ['h-ombra', 'h-avv-sbarra', 'h-tassametro', 'h-sandro-piombo'] },
      ],
      players: [
        { name: 'Tu', type: 'human', henchmen: ['h-vecchio-scassinatore', 'h-lina-velluto'] },
        { name: 'Mamma Rosa', type: 'bot', difficulty: 'medium' },
      ],
    },
  },
  {
    id: 'avvocato',
    title: 'L\'Avvocato salva-malus',
    description: 'Possiedi il Principe del Foro: prendere l\'ultima carta del Pazzo (-7) costa solo 3 punti.',
    spec: {
      gangs: [
        { bossId: 'boss-pazzo', henchmen: ['h-cecchino'] },
        { bossId: 'boss-professore', henchmen: ['h-picchiatore', 'h-informatore', 'h-gatto-nero'] },
      ],
      players: [
        { name: 'Tu', type: 'human', henchmen: ['h-principe-foro'] },
        { name: 'Zio Sal', type: 'bot', difficulty: 'hard' },
      ],
    },
  },
  {
    id: 'finale-nim',
    title: 'Finale alla Nim',
    description: 'Tre file corte, nessuno vuole l\'ultima carta: conta chi resta senza prese sicure.',
    spec: {
      gangs: [
        { bossId: 'boss-fantasma', henchmen: ['h-picchiatore', 'h-esattore', 'h-gatto-nero'] },
        { bossId: 'boss-professore', henchmen: ['h-lina-velluto', 'h-sandro-piombo'] },
        { bossId: 'boss-vedova', henchmen: ['h-cecchino', 'h-conte-fasullo', 'h-avv-sbarra', 'h-contrabbandiere'] },
      ],
      players: [{ name: 'Tu', type: 'human' }, { name: 'Il Padrino', type: 'bot', difficulty: 'hard' }],
    },
  },
  {
    id: 'solo-bot',
    title: 'Tavolo di soli BOT',
    description: 'Quattro BOT di livello diverso giocano da soli: osserva le loro motivazioni.',
    spec: {
      gangs: [
        { bossId: 'boss-padrino', henchmen: ['h-picchiatore', 'h-cecchino', 'h-esattore', 'h-gatto-nero', 'h-lina-velluto'] },
        { bossId: 'boss-macellaio', henchmen: ['h-autista', 'h-sandro-piombo', 'h-informatore', 'h-avvocato'] },
        { bossId: 'boss-mago', henchmen: ['h-trasformista', 'h-lola-tre-carte', 'h-conte-fasullo', 'h-gigolo', 'h-borseggiatore'] },
      ],
      players: [
        { name: 'Facile', type: 'bot', difficulty: 'easy' },
        { name: 'Medio', type: 'bot', difficulty: 'medium' },
        { name: 'Difficile', type: 'bot', difficulty: 'hard' },
        { name: 'Medio 2', type: 'bot', difficulty: 'medium' },
      ],
    },
  },
];
