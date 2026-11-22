/**
 * Punto d'ingresso della versione in file unico (HTML autonomo).
 * Riusa le stesse pagine dell'app Next.js con un router basato sull'ancora.
 */
import { useSyncExternalStore, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '@/app/page';
import SetupPage from '@/app/setup/page';
import GamePage from '@/app/game/page';
import CatalogPage from '@/app/catalog/page';
import RulesPage from '@/app/rules/page';
import SettingsPage from '@/app/settings/page';
import StatsPage from '@/app/stats/page';
import SimulationPage from '@/app/simulation/page';
import DebugPage from '@/app/debug/page';
import { hashToPath } from './routes';

const PAGES: Record<string, ComponentType> = {
  '/': Home,
  '/setup': SetupPage,
  '/game': GamePage,
  '/catalog': CatalogPage,
  '/rules': RulesPage,
  '/settings': SettingsPage,
  '/stats': StatsPage,
  '/simulation': SimulationPage,
  '/debug': DebugPage,
};

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function App() {
  const path = useSyncExternalStore(subscribe, () => hashToPath(location.hash), () => '/');
  const Page = PAGES[path] ?? Home;
  return (
    <div className="flex min-h-dvh flex-col antialiased">
      <Page key={path} />
    </div>
  );
}

createRoot(document.getElementById('gn-root')!).render(<App />);
