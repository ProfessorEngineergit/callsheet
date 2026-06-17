import {
  Inbox,
  CheckSquare,
  CalendarDays,
  Music,
  Users,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  goKey: string; // für "G dann <Taste>" Shortcut
}

export const NAV: NavItem[] = [
  { to: '/', label: 'Inbox', icon: Inbox, goKey: 'i' },
  { to: '/tasks', label: 'Aufgaben', icon: CheckSquare, goKey: 't' },
  { to: '/schedule', label: 'Zeitplan', icon: CalendarDays, goKey: 'z' },
  { to: '/acts', label: 'Programm', icon: Music, goKey: 'p' },
  { to: '/team', label: 'Team', icon: Users, goKey: 'e' },
  { to: '/notes', label: 'Notizen', icon: StickyNote, goKey: 'n' },
];

// Untere Tab-Bar (Mobile): die 5 wichtigsten Ansichten.
export const MOBILE_NAV: NavItem[] = NAV.filter((n) => n.to !== '/notes');
