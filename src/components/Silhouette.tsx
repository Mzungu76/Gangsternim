/** Placeholder grafico: silhouette di gangster con fedora (nessuna immagine esterna). */
export function GangsterSilhouette({ boss = false }: { boss?: boolean }) {
  return (
    <svg className="gn-silhouette" viewBox="0 0 100 120" aria-hidden>
      {/* spalle e giacca */}
      <path d="M10 120 C12 92 28 82 50 80 C72 82 88 92 90 120 Z" fill="currentColor" />
      {/* risvolti */}
      <path d="M50 81 L41 100 L50 96 L59 100 Z" fill="rgba(255,240,210,0.22)" />
      {boss ? <path d="M47 84 L53 84 L55 104 L50 110 L45 104 Z" fill="rgba(160,20,20,0.75)" /> : null}
      {/* collo e testa */}
      <rect x="43" y="64" width="14" height="18" rx="4" fill="currentColor" />
      <ellipse cx="50" cy="52" rx="15" ry="17" fill="currentColor" />
      {/* fedora */}
      <path d="M20 40 C30 34 70 34 80 40 C76 44 24 44 20 40 Z" fill="currentColor" />
      <path d="M32 38 C31 22 36 14 50 14 C64 14 69 22 68 38 Z" fill="currentColor" />
      <path d="M33 31 L67 31 L68 37 L32 37 Z" fill="rgba(255,240,210,0.25)" />
      <path d="M44 15 C47 20 53 20 56 15" stroke="rgba(255,240,210,0.15)" strokeWidth="2" fill="none" />
    </svg>
  );
}
