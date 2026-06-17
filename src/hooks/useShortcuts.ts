import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '@/store/ui';
import { NAV } from '@/lib/nav';

// Tastatur-Shortcuts (Linear-Feeling):
//  ⌘/Ctrl+K  Command-Palette
//  C         neue Aufgabe
//  /         Suche (öffnet Palette)
//  G dann x  „Go to view" (i/t/z/p/e/n)
function isTyping(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
}

export function useShortcuts() {
  const navigate = useNavigate();
  const { setPaletteOpen, setNewTaskOpen } = useUI();
  const goMode = useRef(false);
  const goTimer = useRef<number>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Command-Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      if (goMode.current) {
        const item = NAV.find((n) => n.goKey === e.key.toLowerCase());
        if (item) {
          e.preventDefault();
          navigate(item.to);
        }
        goMode.current = false;
        return;
      }

      if (e.key === 'g') {
        goMode.current = true;
        window.clearTimeout(goTimer.current);
        goTimer.current = window.setTimeout(() => (goMode.current = false), 1200);
        return;
      }
      if (e.key === 'c') {
        e.preventDefault();
        setNewTaskOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, setPaletteOpen, setNewTaskOpen]);
}
