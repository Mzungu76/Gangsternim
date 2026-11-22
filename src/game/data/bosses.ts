import type { BossCard } from '../types';

type BossData = Omit<BossCard, 'kind' | 'imageUrl'> & { imageUrl?: string | null };

const RAW_BOSSES: BossData[] = [
  {
    id: 'boss-padrino',
    name: 'Il Padrino',
    nickname: 'Don Calogero',
    description: 'Non alza mai la voce: gli basta alzare un sopracciglio. Chi gli porta via l\'ultimo uomo riceve un\'offerta che non può rifiutare.',
    minTake: 1, maxTake: 4, malus: 5, color: '#5a1a1a',
  },
  {
    id: 'boss-macellaio',
    name: 'Il Macellaio',
    nickname: 'Mannaia Mancuso',
    description: 'Taglia i conti, le bistecche e ogni tanto qualche socio. Le sue prese sono sempre a pezzi regolari.',
    minTake: 2, maxTake: 3, malus: 3, color: '#7d2020',
  },
  {
    id: 'boss-contabile',
    name: 'Il Contabile',
    nickname: 'Ragionier Due-per-Due',
    description: 'Tutto deve tornare, sempre in coppia. Ha tre registri: quello vero, quello falso e quello per la nonna.',
    minTake: 2, maxTake: 2, malus: 4, color: '#2f4a3a',
  },
  {
    id: 'boss-pazzo',
    name: 'Il Pazzo',
    nickname: 'Johnny Dinamite',
    description: 'Ride quando dovrebbe piangere e spara quando dovrebbe ridere. Conquistarlo è una pessima idea.',
    minTake: 1, maxTake: 5, malus: 7, color: '#8c3b0e',
  },
  {
    id: 'boss-professore',
    name: 'Il Professore',
    nickname: 'Dottor Quadrato',
    description: 'Ha una laurea in filosofia e una in grimaldelli. Procede con calma: una o due mosse alla volta.',
    minTake: 1, maxTake: 2, malus: 2, color: '#24476b',
  },
  {
    id: 'boss-colonnello',
    name: 'Il Colonnello',
    nickname: 'Sergente Medaglia',
    description: 'Non ha mai fatto il militare, ma le medaglie le ha comprate tutte. Esige prese da almeno due uomini.',
    minTake: 2, maxTake: 4, malus: 5, color: '#3d5a1e',
  },
  {
    id: 'boss-fantasma',
    name: 'Il Fantasma',
    nickname: 'Nessuno Lo Ha Visto',
    description: 'Nessuno sa che faccia abbia. Neanche lui, perché ha rotto tutti gli specchi.',
    minTake: 1, maxTake: 3, malus: 4, color: '#3b3f4a',
  },
  {
    id: 'boss-vedova',
    name: 'La Vedova Nera',
    nickname: 'Donna Assunta',
    description: 'Si è sposata cinque volte e indossa il lutto da quattro. Il tè lo offre, ma non bevetelo.',
    minTake: 1, maxTake: 3, malus: 6, color: '#2a1a2e',
  },
  {
    id: 'boss-barone',
    name: 'Il Barone',
    nickname: 'Sua Eccellenza Spaccatutto',
    description: 'Un titolo nobiliare comprato al mercato del pesce. Pretende prese generose, da gran signore.',
    minTake: 2, maxTake: 5, malus: 6, color: '#6b4a2b',
  },
  {
    id: 'boss-sarto',
    name: 'Il Sarto',
    nickname: 'Forbici Fiorentino',
    description: 'Cuce abiti su misura e cappotti di legno. Lavora di precisione: poche carte alla volta.',
    minTake: 1, maxTake: 2, malus: 3, color: '#4a1528',
  },
  {
    id: 'boss-cardinale',
    name: 'Il Cardinale',
    nickname: 'Monsignor Mazzetta',
    description: 'Benedice gli affari e confessa i concorrenti. Con lui si tratta solo all\'ingrosso.',
    minTake: 3, maxTake: 4, malus: 6, color: '#7a1f3d',
  },
  {
    id: 'boss-pugile',
    name: 'Il Pugile',
    nickname: 'Kid Mandibola',
    description: 'Ex campione dei pesi massimi, ora pesa massimo anche sul quartiere. Ha perso tutti i denti, non la grinta.',
    minTake: 1, maxTake: 3, malus: 3, color: '#8b1e1e',
  },
  {
    id: 'boss-duchessa',
    name: 'La Duchessa',
    nickname: 'Lady Perla',
    description: 'Gestisce il locale più elegante della città e la bisca più sporca del porto. Stessa porta, due serrature.',
    minTake: 2, maxTake: 3, malus: 5, color: '#1f5f5b',
  },
  {
    id: 'boss-mago',
    name: 'Il Mago',
    nickname: 'Zio Abracadabra',
    description: 'Fa sparire carte, soldi e testimoni. Nessuno ha mai capito dove finiscano i conigli.',
    minTake: 1, maxTake: 4, malus: 4, color: '#3a2a5c',
  },
  {
    id: 'boss-notaio',
    name: 'Il Notaio',
    nickname: 'Timbro Tremendo',
    description: 'Tre firme, tre timbri, tre copie. Esattamente tre: né una di più, né una di meno.',
    minTake: 3, maxTake: 3, malus: 5, color: '#2c3e50',
  },
  {
    id: 'boss-cuoco',
    name: 'Il Cuoco',
    nickname: 'Polpetta Esposito',
    description: 'La sua trattoria serve la migliore carbonara della città. Il retrobottega serve tutto il resto.',
    minTake: 1, maxTake: 3, malus: 2, color: '#8a6d1d',
  },
];

export const BOSSES: readonly BossCard[] = RAW_BOSSES.map((b) => ({
  ...b,
  kind: 'boss' as const,
  imageUrl: b.imageUrl ?? null,
}));
