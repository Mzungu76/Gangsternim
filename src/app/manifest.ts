import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gangster Nim',
    short_name: 'Gangster Nim',
    description: 'Gioco strategico di carte ispirato al Nim, tra i gangster degli anni \'20 e \'30.',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#17110c',
    theme_color: '#17110c',
    lang: 'it',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
