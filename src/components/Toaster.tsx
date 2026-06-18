import { createPortal } from 'react-dom';
import { Undo2, X } from 'lucide-react';
import { useToast } from '@/store/toast';

// Toast unten – mit optionalem „Rückgängig"-Button (z. B. nach Löschen).
export function Toaster() {
  const { toast, dismiss } = useToast();
  if (!toast) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center px-4 md:bottom-6">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-panel px-3.5 py-2.5 shadow-xl shadow-black/50">
        <span className="text-[13px]">{toast.message}</span>
        {toast.undo && (
          <button
            onClick={() => {
              toast.undo?.();
              dismiss();
            }}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[12px] font-medium text-text hover:bg-hover"
          >
            <Undo2 size={13} /> Rückgängig
          </button>
        )}
        <button onClick={dismiss} className="text-text-tertiary hover:text-text">
          <X size={15} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
