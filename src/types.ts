// Zentrale Typen für die callsheet-App (Firestore-Datenmodell).
// Eine einzelne Projekt-Instanz: 75-Jahr-Feier Waldorfschule Frankfurt.

export type Role = 'admin' | 'member';

// Gruppen für die Feier: das Technik-Team (wir) und die Veranstalter (Schule/Künstler).
export type PersonGroup = 'technik' | 'veranstalter';

export interface Person {
  id: string;
  name: string;
  group: PersonGroup;
  tags: string[];
  role: Role;
  email?: string;
  phone?: string;
  color: string; // Hex für Avatar
  initials: string;
  note?: string;
}

export type ActCategory = 'Musik' | 'Eurythmie' | 'Zauberei' | 'Artistik' | 'Sketch';
export type ActStatus = 'geplant' | 'probt' | 'fertig';

export interface Act {
  id: string;
  title: string;
  performers: string[]; // people-IDs oder Freitext
  category: ActCategory;
  rehearsalTime?: string; // "15:30"
  order: number;
  requirements: string[]; // z.B. "Gerüst","Mast/Seil","Licht","Headsets"
  status: ActStatus;
  note?: string;
}

export type ScheduleDay = 'Mi' | 'Do' | 'Fr' | 'Sa';
export type ScheduleType = 'Aufbau' | 'Probe' | 'Show' | 'Abbau' | 'Sonstiges';

export interface ScheduleBlock {
  id: string;
  day: ScheduleDay;
  start: string;
  end?: string;
  title: string;
  type: ScheduleType;
  responsiblePersonIds: string[];
  note?: string;
  uncertain?: boolean;
  updatedAt?: number;
  updatedBy?: string;
  updatedByName?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'keine' | 'niedrig' | 'mittel' | 'hoch' | 'dringend';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  tags: string[];
  dueDate?: string;
  relatedActId?: string;
  relatedBlockId?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  updatedBy?: string;
  updatedByName?: string;
}

export type NoteAttachType = 'act' | 'task' | 'person' | 'general';

export interface Note {
  id: string;
  body: string; // Markdown
  authorId: string;
  createdAt: number;
  attachedTo?: { type: NoteAttachType; id?: string };
}

// Kommentar/Nachricht – an einer Aufgabe ODER an einem Zeitplan-Punkt (Feed).
export interface Comment {
  id: string;
  taskId?: string;
  blockId?: string;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: number;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
  color: string;
  initials: string;
  createdAt: number;
}
