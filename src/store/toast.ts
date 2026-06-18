import { create } from 'zustand';

interface Toast {
  id: number;
  message: string;
  undo?: () => void; // wenn gesetzt, erscheint ein „Rückgängig"-Button
}

interface ToastState {
  toast: Toast | null;
  show: (message: string, undo?: () => void) => void;
  dismiss: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToast = create<ToastState>((set, get) => ({
  toast: null,
  show: (message, undo) => {
    const id = Date.now();
    set({ toast: { id, message, undo } });
    clearTimeout(timer);
    // Undo-Toasts bleiben länger stehen.
    timer = setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, undo ? 7000 : 3500);
  },
  dismiss: () => {
    clearTimeout(timer);
    set({ toast: null });
  },
}));
