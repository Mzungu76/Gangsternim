import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { pathToHash } from './routes';

/** Sostituto di next/link per la versione in file unico: navigazione via ancora (#). */
export default function Link({ href, children, ...rest }: { href: string; children?: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={pathToHash(href)} {...rest}>
      {children}
    </a>
  );
}
