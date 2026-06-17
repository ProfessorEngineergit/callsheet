// Seed-Daten aus dem realen E-Mail-Verlauf zur 75-Jahr-Feier.
// >>> HIER kannst du später Personen/Programmpunkte/Termine anpassen. <<<
// Stabile Dokument-IDs, damit Verknüpfungen (relatedActId etc.) funktionieren.
import type { Act, Note, Person, ScheduleBlock, Task } from '../src/types';

const AVATAR_COLORS = [
  '#5E6AD2', '#E2B340', '#3FB950', '#E5484D',
  '#B07CE0', '#3F9FD6', '#E8804C', '#D6608F',
];

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function color(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function person(
  id: string,
  name: string,
  tags: string[],
  extra: Partial<Person> = {},
): Person & { id: string } {
  return {
    id,
    name,
    tags,
    role: extra.role ?? 'member',
    email: extra.email,
    phone: extra.phone,
    note: extra.note,
    color: color(name),
    initials: initials(name),
  };
}

export const people: (Person & { id: string })[] = [
  person('kay', 'Kay Schmid', ['Orga', 'Schule', 'Leitung'], {
    role: 'admin',
    email: 'kschmid@waldorfschule-frankfurt.de',
  }),
  person('thorsten', 'Thorsten Hochhaus', ['Technik'], {
    email: 'th@freiraum-erleben.com',
    phone: '+49 163 7459361',
  }),
  person('sarah', 'Sarah Lindermayer', ['Artistik'], {
    email: 'info@sarah-lindermayer.de',
    phone: '0175 7163796',
  }),
  person('emmy', 'Emmy Levedag', ['Artistik'], { email: 'emmy.levedag@icloud.com' }),
  person('julia', 'Julia Janke', ['Orga'], { email: 'juliajanke@googlemail.com' }),
  person('ele', 'Ele', ['Orga'], { email: 'eljaele@googlemail.com' }),
  person('jasper', 'Jasper Janke', ['Orga', 'Artistik'], { email: 'jasper.janke@gmx.de' }),
  person('soeren', 'Sören Pohl', ['Zauberei']),
  person('buehnentechnik', 'Bühnentechnik (Schule)', ['Technik', 'Schule'], {
    email: 'technik@waldorfschule-frankfurt.de',
  }),
];

export const acts: (Act & { id: string })[] = [
  { id: 'act1', order: 1, rehearsalTime: '13:00', title: 'Sketch', performers: ['Schüler'], category: 'Sketch', requirements: ['Headsets', 'Ton'], status: 'geplant' },
  { id: 'act2', order: 2, rehearsalTime: '13:30', title: 'Eurythmie', performers: ['Basfeld/Reymann'], category: 'Eurythmie', requirements: [], status: 'geplant' },
  { id: 'act3', order: 3, rehearsalTime: '14:00', title: 'Breigstreetboys', performers: ['Breigstreetboys'], category: 'Musik', requirements: [], status: 'geplant' },
  { id: 'act4', order: 4, rehearsalTime: '14:15', title: 'Showband', performers: ['Showband'], category: 'Musik', requirements: ['Sound'], status: 'geplant' },
  { id: 'act5', order: 5, rehearsalTime: '15:00', title: 'Luftakrobatik', performers: ['emmy'], category: 'Artistik', requirements: ['Gerüst', 'Rigging'], status: 'geplant' },
  { id: 'act6', order: 6, rehearsalTime: '15:30', title: 'Seil/Mast', performers: ['sarah'], category: 'Artistik', requirements: ['Mast/Seil', 'Licht'], status: 'geplant' },
  { id: 'act7', order: 7, rehearsalTime: '16:00', title: 'Zauberei', performers: ['kay'], category: 'Zauberei', requirements: [], status: 'geplant' },
  { id: 'act8', order: 8, rehearsalTime: '16:30', title: 'Zauberei', performers: ['soeren'], category: 'Zauberei', requirements: [], status: 'geplant' },
  { id: 'act9', order: 9, rehearsalTime: '17:00', title: 'Musik', performers: ['Göbels/Sitter'], category: 'Musik', requirements: [], status: 'geplant' },
];

export const blocks: (ScheduleBlock & { id: string })[] = [
  // Mi
  { id: 'mi1', day: 'Mi', start: '14:00', title: 'Aufbau Bühnentechnik für die Monatsfeier', type: 'Aufbau', responsiblePersonIds: ['buehnentechnik'], uncertain: true, note: 'Beginn „ab 14 Uhr" noch unbestätigt.' },
  // Do
  { id: 'do1', day: 'Do', start: '08:00', end: '09:00', title: 'Probe Instrumentalkreis', type: 'Probe', responsiblePersonIds: [] },
  { id: 'do2', day: 'Do', start: '10:00', end: '11:30', title: 'Monatsfeier', type: 'Sonstiges', responsiblePersonIds: [] },
  { id: 'do3', day: 'Do', start: '12:00', end: '14:00', title: 'Probe Oberstufenorchester', type: 'Probe', responsiblePersonIds: [] },
  { id: 'do4', day: 'Do', start: '14:00', end: '21:00', title: 'Aufbau Bühnentechnik + Artistengerüste', type: 'Aufbau', responsiblePersonIds: ['thorsten'], note: 'Gerüste bleiben auf der Bühne und können bis Freitagabend NICHT abgebaut werden. Sarah kommt ~16:00, braucht 2–3 Std. für Mast/Seil + Licht, bekommt 1 Aufbauhilfe.' },
  // Fr
  { id: 'fr1', day: 'Fr', start: '09:30', end: '10:00', title: 'Generalprobe Zwergenorchester', type: 'Probe', responsiblePersonIds: [] },
  { id: 'fr2', day: 'Fr', start: '10:00', end: '12:00', title: 'Generalprobe Instrumentalkreis (notfalls Foyer)', type: 'Probe', responsiblePersonIds: [] },
  { id: 'fr3', day: 'Fr', start: '13:00', end: '18:00', title: 'Proben + Licht-/Tonproben (Ablaufplan siehe Programm)', type: 'Probe', responsiblePersonIds: ['thorsten'] },
  { id: 'fr4', day: 'Fr', start: '19:00', end: '23:00', title: 'SHOW', type: 'Show', responsiblePersonIds: ['kay', 'thorsten'] },
  { id: 'fr5', day: 'Fr', start: '23:00', end: '01:00', title: 'Abbau Bühnentechnik', type: 'Abbau', responsiblePersonIds: ['thorsten'] },
  // Sa
  { id: 'sa1', day: 'Sa', start: '10:00', end: '12:00', title: 'Generalprobe Oberstufenorchester', type: 'Probe', responsiblePersonIds: [] },
  { id: 'sa2', day: 'Sa', start: '16:00', end: '18:00', title: 'Konzert', type: 'Sonstiges', responsiblePersonIds: [], note: 'Thorsten/Technik frei – Schulprogramm.' },
];

const now = Date.now();
export const tasks: (Task & { id: string })[] = [
  { id: 'task1', title: 'Mittwoch-Aufbau „ab 14 Uhr" verbindlich bestätigen', description: 'Von Kay selbst mit ???? markiert.', status: 'blocked', priority: 'mittel', assigneeIds: ['kay'], tags: ['Orga', 'Technik'], relatedBlockId: 'mi1', createdAt: now, updatedAt: now, createdBy: 'seed' },
  { id: 'task2', title: 'Videoaufzeichnung: Tonsumme für die Aufzeichner?', description: 'Kontakt herstellen.', status: 'todo', priority: 'mittel', assigneeIds: ['thorsten', 'kay'], tags: ['Technik'], createdAt: now, updatedAt: now, createdBy: 'seed' },
  { id: 'task3', title: 'LED-Wand: Idle-Content entscheiden', description: 'Vorschlag: PPT-Slideshow mit Infos/Bildern.', status: 'todo', priority: 'niedrig', assigneeIds: ['thorsten'], tags: ['Technik', 'Orga'], createdAt: now, updatedAt: now, createdBy: 'seed' },
  { id: 'task4', title: 'CEE-Kabel-Bedarf für LED-Wand klären', description: 'Thorsten kann Ersatz mitbringen.', status: 'todo', priority: 'niedrig', assigneeIds: ['thorsten'], tags: ['Technik'], createdAt: now, updatedAt: now, createdBy: 'seed' },
  { id: 'task5', title: 'Gerüst-Abbau in der Pause: Helfer aus Ele/Julia-Gruppe?', status: 'todo', priority: 'mittel', assigneeIds: ['julia', 'kay'], tags: ['Orga', 'Artistik'], createdAt: now, updatedAt: now, createdBy: 'seed' },
  { id: 'task6', title: 'Aufbauhilfe für Sarah (Do ab 16:00) zuteilen', status: 'todo', priority: 'mittel', assigneeIds: ['kay'], tags: ['Orga', 'Artistik'], relatedActId: 'act6', relatedBlockId: 'do4', createdAt: now, updatedAt: now, createdBy: 'seed' },
  { id: 'task7', title: 'Verbindliches Show-Datum festlegen', description: 'Der Verlauf nennt nur Wochentage Mi–Sa, kein Kalenderdatum.', status: 'todo', priority: 'hoch', assigneeIds: ['kay'], tags: ['Orga'], createdAt: now, updatedAt: now, createdBy: 'seed' },
];

export const notes: (Note & { id: string })[] = [
  { id: 'note1', body: '**Gerüste** bleiben nach dem Aufbau am Do auf der Bühne und können bis **Freitagabend nicht** abgebaut werden.', authorId: 'thorsten', createdAt: now, attachedTo: { type: 'act', id: 'act6' } },
];
