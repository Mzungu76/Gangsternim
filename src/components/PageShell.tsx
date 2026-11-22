import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function PageShell({ title, children, back = '/', actions }: { title: string; children: React.ReactNode; back?: string | null; actions?: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        {back !== null ? (
          <Link href={back} className="gn-btn gn-btn--ghost gn-btn--sm" aria-label="Torna indietro">
            <ArrowLeft size={18} /> Indietro
          </Link>
        ) : null}
        <h1 className="gn-title flex-1 text-3xl sm:text-4xl">{title}</h1>
        {actions}
      </header>
      {children}
    </div>
  );
}
