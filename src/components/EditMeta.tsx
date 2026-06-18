import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { History } from 'lucide-react';
import { relativeTime } from '@/lib/utils';

// Zeigt „Zuletzt geändert von WEM · WANN" – nur wenn Daten vorhanden sind.
export function EditMeta({
  by,
  at,
  className = '',
}: {
  by?: string;
  at?: number;
  className?: string;
}) {
  if (!at) return null;
  return (
    <div
      className={`flex items-center gap-1.5 text-[11px] text-text-tertiary ${className}`}
      title={format(at, "EEEE, d. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
    >
      <History size={11} />
      <span>
        Geändert {relativeTime(at)}
        {by ? ` · ${by}` : ''}
      </span>
    </div>
  );
}
