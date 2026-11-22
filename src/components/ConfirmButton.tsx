'use client';
import { useEffect, useState } from 'react';

/**
 * Pulsante con conferma integrata nella pagina (niente window.confirm):
 * il primo clic chiede conferma, il secondo esegue l'azione.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  disabled,
  className = 'gn-btn gn-btn--danger',
  testId,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
  testId?: string;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 5000);
    return () => clearTimeout(t);
  }, [armed]);
  if (!armed) {
    return (
      <button type="button" className={className} disabled={disabled} onClick={() => setArmed(true)} data-testid={testId}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-2" role="group" aria-label={confirmLabel}>
      <button
        type="button"
        className={className}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
        data-testid={testId ? `${testId}-confirm` : undefined}
      >
        {confirmLabel}
      </button>
      <button type="button" className="gn-btn gn-btn--ghost gn-btn--sm" onClick={() => setArmed(false)}>
        Annulla
      </button>
    </span>
  );
}
