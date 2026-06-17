import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pill({
  children,
  color,
  onRemove,
}: {
  children: ReactNode;
  color?: string;
  onRemove?: () => void;
}) {
  return (
    <span className="pill" style={color ? { borderColor: color + '55' } : undefined}>
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 text-text-tertiary hover:text-text">
          <X size={11} />
        </button>
      )}
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-text-secondary">
      <Loader2 size={16} className="animate-spin" />
      {label && <span>{label}</span>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="text-text-tertiary">{icon}</div>}
      <div className="text-text">{title}</div>
      {hint && <div className="max-w-xs text-text-secondary">{hint}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Einfacher Popover/Menu mit Outside-Click-Schließen.
export function Menu({
  trigger,
  children,
  align = 'left',
}: {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center">
        {trigger(open)}
      </button>
      {open && (
        <div
          className={cn(
            'absolute z-40 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border bg-panel py-1 shadow-xl',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-hover',
        active ? 'text-text' : 'text-text-secondary',
      )}
    >
      {children}
    </button>
  );
}

// Modal/Sheet: rechts als Drawer (Desktop), unten als Vollbild-Sheet (Mobile).
export function Sheet({
  open,
  onClose,
  children,
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'right' | 'center';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex" onMouseDown={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'relative ml-auto flex h-full w-full flex-col border-border bg-panel',
          side === 'right'
            ? 'sm:max-w-[460px] sm:border-l'
            : 'max-w-lg sm:m-auto sm:h-auto sm:max-h-[88vh] sm:rounded-xl sm:border',
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
