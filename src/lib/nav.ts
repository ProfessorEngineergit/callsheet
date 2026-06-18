import { Inbox, CalendarDays, CheckSquare, Users, type LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  goKey: string; // für "G dann <Taste>" Shortcut
}

// Reihenfolge auf die Feier ausgerichtet: Inbox → Zeitplan → Aufgaben → Team.
export const NAV: NavItem[] = [
  { to: '/', label: 'Inbox', icon: Inbox, goKey: 'i' },
  { to: '/schedule', label: 'Zeitplan', icon: CalendarDays, goKey: 'z' },
  { to: '/tasks', label: 'Aufgaben', icon: CheckSquare, goKey: 'a' },
  { to: '/team', label: 'Team', icon: Users, goKey: 't' },
];

// Untere Tab-Bar (Mobile): identisch.
export const MOBILE_NAV: NavItem[] = NAV;
