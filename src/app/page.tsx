'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { BarChart3, BookOpen, FlaskConical, LibraryBig, Play, RotateCcw, Settings, Wrench } from 'lucide-react';
import { BossCardView, HenchmanCardView } from '@/components/cards/GameCard';
import { getBoss, getHenchman } from '@/game/catalog';
import { gameStore, useGameStore } from '@/lib/gameStore';

export default function Home() {
  const { game, hydrated } = useGameStore();
  useEffect(() => gameStore.hydrate(), []);
  const canContinue = hydrated && game?.status === 'playing';

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-12 pt-10 sm:pt-16">
      <div className="text-center">
        <p className="gn-type text-sm tracking-[0.3em] text-sand">CHICAGO · 1929</p>
        <h1 className="gn-title mt-2 text-5xl leading-none sm:text-7xl" data-testid="logo">
          GANGSTER
          <span className="block text-ivory">NIM</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-cream">
          Porta via gli scagnozzi alle famiglie rivali, costruisci la banda migliore e lascia agli altri il Boss… e il suo conto da pagare.
        </p>
      </div>

      <div className="pointer-events-none my-8 flex items-end justify-center gap-2 sm:gap-4" aria-hidden>
        <div className="-rotate-6"><HenchmanCardView card={getHenchman('h-cecchino')} size="sm" /></div>
        <div className="-translate-y-3"><BossCardView card={getBoss('boss-padrino')} size="md" /></div>
        <div className="rotate-6"><HenchmanCardView card={getHenchman('h-vecchio-scassinatore')} size="sm" /></div>
      </div>

      <nav className="grid w-full max-w-md gap-3" aria-label="Menu principale">
        <Link href="/setup" className="gn-btn text-lg" data-testid="new-game">
          <Play size={20} /> Nuova partita
        </Link>
        {canContinue ? (
          <Link href="/game" className="gn-btn gn-btn--ghost" data-testid="continue-game">
            <RotateCcw size={18} /> Continua partita (turno {game!.turn})
          </Link>
        ) : (
          <button type="button" className="gn-btn gn-btn--ghost" disabled data-testid="continue-game" title="Nessuna partita salvata">
            <RotateCcw size={18} /> Continua partita
            <span className="text-xs normal-case tracking-normal opacity-80">— nessuna partita in corso</span>
          </button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/catalog" className="gn-btn gn-btn--ghost"><LibraryBig size={18} /> Catalogo</Link>
          <Link href="/rules" className="gn-btn gn-btn--ghost"><BookOpen size={18} /> Regolamento</Link>
          <Link href="/settings" className="gn-btn gn-btn--ghost"><Settings size={18} /> Impostazioni</Link>
          <Link href="/stats" className="gn-btn gn-btn--ghost"><BarChart3 size={18} /> Statistiche</Link>
          <Link href="/simulation" className="gn-btn gn-btn--ghost"><FlaskConical size={18} /> Simulazione</Link>
          <Link href="/debug" className="gn-btn gn-btn--ghost"><Wrench size={18} /> Modalità test</Link>
        </div>
      </nav>
    </main>
  );
}
