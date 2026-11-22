import type { Specialization } from '../types';

export interface SpecializationInfo {
  id: Specialization;
  label: string;
  plural: string;
  /** Nome dell'icona Lucide usata dall'interfaccia (mappata in components/SpecIcon). */
  icon: string;
  color: string;
}

export const SPECIALIZATION_INFO: Record<Specialization, SpecializationInfo> = {
  picchiatore: { id: 'picchiatore', label: 'Picchiatore', plural: 'Picchiatori', icon: 'hand-fist', color: '#8b1e1e' },
  scassinatore: { id: 'scassinatore', label: 'Scassinatore', plural: 'Scassinatori', icon: 'key', color: '#6b4a2b' },
  autista: { id: 'autista', label: 'Autista', plural: 'Autisti', icon: 'car', color: '#1f5f5b' },
  tiratore: { id: 'tiratore', label: 'Tiratore', plural: 'Tiratori', icon: 'crosshair', color: '#4a1528' },
  informatore: { id: 'informatore', label: 'Informatore', plural: 'Informatori', icon: 'ear', color: '#7a5c12' },
  avvocato: { id: 'avvocato', label: 'Avvocato', plural: 'Avvocati', icon: 'scale', color: '#2c3e50' },
  truffatore: { id: 'truffatore', label: 'Truffatore', plural: 'Truffatori', icon: 'drama', color: '#6d2e5b' },
  contrabbandiere: { id: 'contrabbandiere', label: 'Contrabbandiere', plural: 'Contrabbandieri', icon: 'package', color: '#3d5a1e' },
  ladro: { id: 'ladro', label: 'Ladro', plural: 'Ladri', icon: 'gem', color: '#24476b' },
  esattore: { id: 'esattore', label: 'Esattore', plural: 'Esattori', icon: 'coins', color: '#8a6d1d' },
};
