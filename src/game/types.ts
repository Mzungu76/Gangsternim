/**
 * Modelli TypeScript di GANGSTER NIM.
 * Nessuna dipendenza da React: questi tipi sono condivisi da motore, BOT,
 * simulazione, salvataggio e interfaccia.
 */

export const SPECIALIZATIONS = [
  'picchiatore',
  'scassinatore',
  'autista',
  'tiratore',
  'informatore',
  'avvocato',
  'truffatore',
  'contrabbandiere',
  'ladro',
  'esattore',
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

/** Carta Boss: stabilisce i limiti di presa permanenti della gang e il malus. */
export interface BossCard {
  id: string;
  kind: 'boss';
  name: string;
  nickname: string;
  description: string;
  /** Numero minimo di carte prelevabili per turno da questa gang. */
  minTake: number;
  /** Numero massimo di carte prelevabili per turno da questa gang. */
  maxTake: number;
  /** Malus (valore positivo) subito da chi conquista il Boss. */
  malus: number;
  /** Colore identificativo (hex). */
  color: string;
  imageUrl: string | null;
}

/**
 * Effetti tipizzati degli Scagnozzi. Nessuna funzione nei dati: ogni effetto è
 * un oggetto dichiarativo interpretato dal motore (src/game/effects.ts).
 *
 * `spec: 'self'` indica la specializzazione della carta stessa.
 */
export type HenchmanEffect =
  | { type: 'none' }
  /** +bonus se possiedi almeno `minCount` ALTRI Scagnozzi della specializzazione indicata. */
  | { type: 'withSpec'; spec: Specialization | 'self'; minCount: number; bonus: number }
  /** +perCard per ogni ALTRO Scagnozzo posseduto della specializzazione indicata, fino a `max`. */
  | { type: 'perSpecCard'; spec: Specialization | 'self'; perCard: number; max: number }
  /** +perSpec per ogni specializzazione diversa posseduta (questa inclusa), fino a `max`. */
  | { type: 'perDistinctSpec'; perSpec: number; max: number }
  /** +bonus (anche negativo) se NON possiedi alcuno Scagnozzo della specializzazione indicata. */
  | { type: 'withoutSpec'; spec: Specialization; bonus: number }
  /** +perBoss per ogni Boss conquistato, fino a `max`. */
  | { type: 'perBoss'; perBoss: number; max: number }
  /** +bonus se a fine conteggio non possiedi alcun Boss. */
  | { type: 'noBoss'; bonus: number }
  /** Riduce di `amount` il malus di un Boss conquistato (mai sotto zero). */
  | { type: 'malusReduction'; amount: number }
  /** +bonus se possiedi STRETTAMENTE più Scagnozzi della specializzazione di ogni altro giocatore. */
  | { type: 'majority'; spec: Specialization | 'self'; bonus: number }
  /** +bonus per ogni gruppo completo di `every` Scagnozzi posseduti, fino a `max`. */
  | { type: 'collectionSize'; every: number; bonus: number; max: number }
  /** Immediato: +bonus se conquistata in una presa di almeno `minTaken` carte. */
  | { type: 'captureSize'; minTaken: number; bonus: number }
  /** Immediato: +bonus se conquistata come ultimo Scagnozzo della fila (insieme al Boss). */
  | { type: 'lastHenchman'; bonus: number }
  /** Immediato: +bonus se conquistata nella prima presa effettuata su quella gang. */
  | { type: 'firstTake'; bonus: number }
  /** Combo: nelle combinazioni vale come una qualsiasi specializzazione (scelta ottimale automatica). */
  | { type: 'comboWildcard' }
  /** +bonus se hai completato una combo di almeno `minComboSize` carte nella specializzazione indicata. */
  | { type: 'comboBooster'; spec: Specialization | 'self'; minComboSize: number; bonus: number };

export type EffectType = HenchmanEffect['type'];

/** Momento in cui un effetto viene applicato. */
export type EffectTiming = 'none' | 'immediate' | 'conditional' | 'permanent' | 'combo';

export interface HenchmanCard {
  id: string;
  kind: 'henchman';
  name: string;
  nickname: string | null;
  specialization: Specialization;
  basePoints: number;
  effect: HenchmanEffect;
  /** Testo di colore (non regolamentare). Condizione ed effetto sono generati da `effect`. */
  flavor: string;
  imageUrl: string | null;
}

export type Card = BossCard | HenchmanCard;

export interface ComboDefinition {
  id: string;
  name: string;
  /** Numero di carte della stessa specializzazione richieste. */
  size: number;
  /** Punti complessivi assegnati al gruppo. */
  points: number;
}

// ---------------------------------------------------------------------------
// Stato della partita
// ---------------------------------------------------------------------------

export type PlayerType = 'human' | 'bot';
export type BotDifficulty = 'easy' | 'medium' | 'hard';
export type BotSpeed = 'fast' | 'normal' | 'slow';

export interface PlayerConfig {
  name: string;
  type: PlayerType;
  difficulty?: BotDifficulty;
}

export interface GameConfig {
  players: PlayerConfig[];
  /** Numero di gang sul tavolo (2-6, default 4). */
  gangCount: number;
  /** Numero minimo di Scagnozzi per gang (4-6). */
  henchmenMin: number;
  /** Numero massimo di Scagnozzi per gang (4-6). */
  henchmenMax: number;
  /** Seed per la distribuzione riproducibile delle carte. */
  seed: number;
  /** Indice del giocatore che inizia (default 0). */
  startingPlayer?: number;
}

export interface CapturedHenchman {
  cardId: string;
  turn: number;
  gangId: string;
  /** Bonus immediato registrato al momento della conquista. */
  immediateBonus: number;
}

export interface CapturedBoss {
  cardId: string;
  turn: number;
  gangId: string;
}

export interface PlayerState {
  id: string;
  name: string;
  type: PlayerType;
  difficulty: BotDifficulty | null;
  /** Colore identificativo (hex). */
  color: string;
  henchmen: CapturedHenchman[];
  bosses: CapturedBoss[];
}

export interface GangState {
  id: string;
  bossId: string;
  /** Scagnozzi ancora sul tavolo, da sinistra (vicino al Boss) a destra. Si preleva dalla fine. */
  henchmen: string[];
  initialSize: number;
  /** Numero di prese già effettuate su questa gang. */
  takes: number;
  eliminated: boolean;
  capturedBy: string | null;
}

export interface MoveRecord {
  turn: number;
  playerId: string;
  gangId: string;
  count: number;
  cardIds: string[];
  bossCaptured: boolean;
  /** Motivazione prodotta dal motore BOT (solo per mosse dei BOT). */
  botReason?: string;
}

export type GameStatus = 'playing' | 'finished';

export interface GameState {
  schemaVersion: number;
  id: string;
  seed: number;
  config: GameConfig;
  players: PlayerState[];
  gangs: GangState[];
  currentPlayerIndex: number;
  /** Numero del turno corrente (1-based, una mossa per turno). */
  turn: number;
  history: MoveRecord[];
  status: GameStatus;
  createdAt: string;
  finishedAt: string | null;
}

export interface Move {
  gangId: string;
  count: number;
}
