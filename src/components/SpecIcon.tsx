import { Car, Coins, Crosshair, Drama, Ear, Gem, HandFist, KeyRound, Package, Scale, type LucideProps } from 'lucide-react';
import type { Specialization } from '@/game/types';

const ICONS: Record<Specialization, React.ComponentType<LucideProps>> = {
  picchiatore: HandFist,
  scassinatore: KeyRound,
  autista: Car,
  tiratore: Crosshair,
  informatore: Ear,
  avvocato: Scale,
  truffatore: Drama,
  contrabbandiere: Package,
  ladro: Gem,
  esattore: Coins,
};

export function SpecIcon({ spec, ...props }: { spec: Specialization } & LucideProps) {
  const Icon = ICONS[spec];
  return <Icon aria-hidden {...props} />;
}
