import { create } from 'zustand';

interface UIState {
  // Command-Palette
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
  // Globale Suche
  search: string;
  setSearch: (v: string) => void;
  // Task-Detail-Drawer
  openTaskId: string | null;
  setOpenTaskId: (id: string | null) => void;
  // "Neue Aufgabe"-Dialog
  newTaskOpen: boolean;
  setNewTaskOpen: (v: boolean) => void;
  // Mobile-Nav
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  paletteOpen: false,
  setPaletteOpen: (v) => set({ paletteOpen: v }),
  search: '',
  setSearch: (v) => set({ search: v }),
  openTaskId: null,
  setOpenTaskId: (id) => set({ openTaskId: id }),
  newTaskOpen: false,
  setNewTaskOpen: (v) => set({ newTaskOpen: v }),
  mobileNavOpen: false,
  setMobileNavOpen: (v) => set({ mobileNavOpen: v }),
}));
