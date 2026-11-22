'use client';
import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** True solo nel browser dopo l'idratazione (evita differenze tra server e client). */
export function useIsClient(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
