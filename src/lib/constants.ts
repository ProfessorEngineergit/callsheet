import type {
  ActCategory,
  ActStatus,
  ScheduleType,
  TaskPriority,
  TaskStatus,
} from '@/types';

export const TAGS = [
  'Orga', 'Technik', 'Artistik', 'Musik', 'Eurythmie', 'Zauberei', 'Schule', 'Leitung',
] as const;

export const TASK_STATUS: Record<TaskStatus, { label: string; color: string }> = {
  todo:        { label: 'Todo',       color: 'var(--status-todo)' },
  in_progress: { label: 'In Arbeit',  color: 'var(--status-progress)' },
  blocked:     { label: 'Blockiert',  color: 'var(--status-blocked)' },
  done:        { label: 'Erledigt',   color: 'var(--status-done)' },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

export const TASK_PRIORITY: Record<TaskPriority, { label: string; rank: number; color: string }> = {
  dringend: { label: 'Dringend', rank: 4, color: '#E6E7EA' },
  hoch:     { label: 'Hoch',     rank: 3, color: '#C0C0C0' },
  mittel:   { label: 'Mittel',   rank: 2, color: '#9598A1' },
  niedrig:  { label: 'Niedrig',  rank: 1, color: '#6A6D75' },
  keine:    { label: 'Keine',    rank: 0, color: '#6A6D75' },
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = [
  'dringend', 'hoch', 'mittel', 'niedrig', 'keine',
];

// B&W: Alle Kategorien in Graustufen
export const ACT_CATEGORY: Record<ActCategory, string> = {
  Musik:     '#E6E7EA',
  Eurythmie: '#C0C0C0',
  Zauberei:  '#9598A1',
  Artistik:  '#6A6D75',
  Sketch:    '#444649',
};

export const ACT_STATUS: Record<ActStatus, { label: string; color: string }> = {
  geplant: { label: 'Geplant', color: 'var(--status-todo)' },
  probt:   { label: 'Probt',   color: 'var(--status-progress)' },
  fertig:  { label: 'Fertig',  color: 'var(--status-done)' },
};

// B&W: Zeitplan-Typen in Graustufen
export const SCHEDULE_TYPE: Record<ScheduleType, string> = {
  Show:      '#FFFFFF',   // weiß = am wichtigsten
  Aufbau:    '#C0C0C0',
  Abbau:     '#9598A1',
  Probe:     '#6A6D75',
  Sonstiges: '#444649',
};

export const DAYS: { key: 'Mi' | 'Do' | 'Fr' | 'Sa'; label: string }[] = [
  { key: 'Mi', label: 'Mittwoch' },
  { key: 'Do', label: 'Donnerstag' },
  { key: 'Fr', label: 'Freitag' },
  { key: 'Sa', label: 'Samstag' },
];

// Avatar-Graustufen-Palette
export const AVATAR_COLORS = [
  '#4A4A4A',
  '#606060',
  '#757575',
  '#8A8A8A',
  '#9E9E9E',
  '#B3B3B3',
  '#383838',
  '#525252',
];
