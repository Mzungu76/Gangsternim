import type { Metadata, Viewport } from 'next';
import '@fontsource/limelight/400.css';
import '@fontsource/oswald/400.css';
import '@fontsource/oswald/600.css';
import '@fontsource/special-elite/400.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gangster Nim',
  description: 'Gioco strategico di carte per 2-4 giocatori ispirato al Nim, ambientato tra i gangster degli anni \'20 e \'30.',
  applicationName: 'Gangster Nim',
  appleWebApp: { capable: true, title: 'Gangster Nim', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#17110c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="it" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
