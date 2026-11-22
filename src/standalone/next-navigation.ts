import { navigate } from './routes';

/** Sostituto di next/navigation per la versione in file unico. */
export function useRouter() {
  return { push: navigate, replace: navigate, back: () => history.back(), refresh: () => {}, prefetch: () => {} };
}
