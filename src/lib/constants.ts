import type {
  ActCategory,
  ActStatus,
  ScheduleType,
  TaskPriority,
  TaskStatus,
} from '@/types';

// Globale Tag-/Bereichsliste (aus dem realen E-Mail-Verlauf).
export const TAGS = [
  'Orga',
  'Technik',
  'Artistik',
  'Musik',
  'Eurythmie',
  'Zauberei',
  'Schule',
  'Leitung',
] as const;

export const TASK_STATUS: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  todo: { label: 'Todo', color: 'var(--status-todo)' },
  in_progress: { label: 'In Arbeit', color: 'var(--status-progress)' },
  blocked: { label: 'Blockiert', color: 'var(--status-blocked)' },
  done: { label: 'Erledigt', color: 'var(--status-done)' },
};

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

export const TASK_PRIORITY: Record<
  TaskPriority,
  { label: string; rank: number; color: string }
> = {
  dringend: { label: 'Dringend', rank: 4, color: '#E5484D' },
  hoch: { label: 'Hoch', rank: 3, color: '#E2B340' },
  mittel: { label: 'Mittel', rank: 2, color: '#9598A1' },
  niedrig: { label: 'Niedrig', rank: 1, color: '#6A6D75' },
  keine: { label: 'Keine', rank: 0, color: '#6A6D75' },
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = [
  'dringend',
  'hoch',
  'mittel',
  'niedrig',
  'keine',
];

export const ACT_CATEGORY: Record<ActCategory, string> = {
  Musik: '#5E6AD2',
  Eurythmie: '#3FB950',
  Zauberei: '#B07CE0',
  Artistik: '#E2B340',
  Sketch: '#E5484D',
};

export const ACT_STATUS: Record<ActStatus, { label: string; color: string }> = {
  geplant: { label: 'Geplant', color: 'var(--status-todo)' },
  probt: { label: 'Probt', color: 'var(--status-progress)' },
  fertig: { label: 'Fertig', color: 'var(--status-done)' },
};

export const SCHEDULE_TYPE: Record<ScheduleType, string> = {
  Aufbau: '#E2B340',
  Probe: '#5E6AD2',
  Show: '#3FB950',
  Abbau: '#E5484D',
  Sonstiges: '#9598A1',
};

export const DAYS: { key: 'Mi' | 'Do' | 'Fr' | 'Sa'; label: string }[] = [
  { key: 'Mi', label: 'Mittwoch' },
  { key: 'Do', label: 'Donnerstag' },
  { key: 'Fr', label: 'Freitag' },
  { key: 'Sa', label: 'Samstag' },
];

// Avatar-Farbpalette – deterministisch aus Namen abgeleitet.
export const AVATAR_COLORS = [
  '#5E6AD2',
  '#E2B340',
  '#3FB950',
  '#E5484D',
  '#B07CE0',
  '#3F9FD6',
  '#E8804C',
  '#D6608F',
];
