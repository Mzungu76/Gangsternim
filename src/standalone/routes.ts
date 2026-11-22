/** Mappa percorsi dell'app ↔ ancore della versione in file unico (solo lettere e trattini). */
export const ROUTES: Record<string, string> = {
  '/': 'home',
  '/setup': 'nuova-partita',
  '/game': 'tavolo',
  '/catalog': 'catalogo',
  '/rules': 'regolamento',
  '/settings': 'impostazioni',
  '/stats': 'statistiche',
  '/simulation': 'simulazione',
  '/debug': 'modalita-test',
};

export function pathToHash(path: string): string {
  return `#${ROUTES[path] ?? 'home'}`;
}

export function hashToPath(hash: string): string {
  const name = hash.replace(/^#/, '');
  return Object.keys(ROUTES).find((p) => ROUTES[p] === name) ?? '/';
}

export function navigate(path: string) {
  const h = pathToHash(path);
  if (location.hash !== h) location.hash = h;
  window.scrollTo(0, 0);
}
