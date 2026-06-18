// Befüllt Firestore direkt aus dem Browser (kein Service-Account nötig).
// Wird nur aufgerufen, wenn die Datenbank leer ist (keine People).
// Enthält bewusst KEINE Beispielaufgaben – die Aufgaben legt ihr selbst an.
import { collection, doc, getCountFromServer, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import type { Person, ScheduleBlock } from '@/types';

// >>> HIER kannst du Personen anpassen. <<<
// Technik-Team = wir; Veranstalter = Schule & Künstler (aus dem E-Mail-Verlauf).
const PEOPLE: (Person & { id: string })[] = [
  // ── Technik-Team ──
  { id: 'kay',      name: 'Kay Schmid',        group: 'technik', role: 'admin',  tags: ['Leitung'],  email: 'kschmid@waldorfschule-frankfurt.de', color: '#4A4A4A', initials: 'KS' },
  { id: 'bahrian',  name: 'Bahrian Novotny',   group: 'technik', role: 'admin',  tags: ['Technik'],  email: 'bahriannovotny@gmail.com',           color: '#606060', initials: 'BN' },
  { id: 'lorenzo',  name: 'Lorenzo Bay-Müller',group: 'technik', role: 'member', tags: ['Technik'],                                              color: '#757575', initials: 'LB' },
  { id: 'thorsten', name: 'Thorsten Hochhaus', group: 'technik', role: 'member', tags: ['Technik'],  email: 'th@freiraum-erleben.com', phone: '+49 163 7459361', color: '#8A8A8A', initials: 'TH' },
  { id: 'simon',    name: 'Simon Bentlage',    group: 'technik', role: 'member', tags: ['Technik'],                                              color: '#9E9E9E', initials: 'SB' },
  { id: 'annika',   name: 'Annika Hartel',     group: 'technik', role: 'member', tags: ['Technik'],                                              color: '#B3B3B3', initials: 'AH' },
  { id: 'lou',      name: 'Lou Huber',         group: 'technik', role: 'member', tags: ['Technik'],                                              color: '#5A5A5A', initials: 'LH' },
  // ── Veranstalter (Schule & Künstler) ──
  { id: 'sarah',    name: 'Sarah Lindermayer', group: 'veranstalter', role: 'member', tags: ['Artistik'], email: 'info@sarah-lindermayer.de', phone: '0175 7163796', color: '#525252', initials: 'SL' },
  { id: 'emmy',     name: 'Emmy Levedag',      group: 'veranstalter', role: 'member', tags: ['Artistik'], email: 'emmy.levedag@icloud.com',   color: '#383838', initials: 'EL' },
  { id: 'julia',    name: 'Julia Janke',       group: 'veranstalter', role: 'member', tags: ['Orga'],     email: 'juliajanke@googlemail.com', color: '#4A4A4A', initials: 'JJ' },
  { id: 'ele',      name: 'Ele',               group: 'veranstalter', role: 'member', tags: ['Orga'],     email: 'eljaele@googlemail.com',    color: '#606060', initials: 'EL' },
  { id: 'jasper',   name: 'Jasper Janke',      group: 'veranstalter', role: 'member', tags: ['Orga','Artistik'], email: 'jasper.janke@gmx.de', color: '#757575', initials: 'JJ' },
  { id: 'soeren',   name: 'Sören Pohl',        group: 'veranstalter', role: 'member', tags: ['Zauberei'], color: '#8A8A8A', initials: 'SP' },
  { id: 'buehnentechnik', name: 'Bühnentechnik (Schule)', group: 'veranstalter', role: 'member', tags: ['Technik','Schule'], email: 'technik@waldorfschule-frankfurt.de', color: '#9E9E9E', initials: 'BT' },
];

// Zeitplan Mi–Sa aus dem E-Mail-Verlauf.
const BLOCKS: (ScheduleBlock & { id: string })[] = [
  { id: 'mi1', day: 'Mi', start: '14:00', title: 'Aufbau Bühnentechnik für die Monatsfeier', type: 'Aufbau', responsiblePersonIds: ['buehnentechnik'] },
  { id: 'do1', day: 'Do', start: '08:00', end: '09:00', title: 'Probe Instrumentalkreis', type: 'Probe', responsiblePersonIds: [] },
  { id: 'do2', day: 'Do', start: '10:00', end: '11:30', title: 'Monatsfeier', type: 'Sonstiges', responsiblePersonIds: [] },
  { id: 'do3', day: 'Do', start: '12:00', end: '14:00', title: 'Probe Oberstufenorchester', type: 'Probe', responsiblePersonIds: [] },
  { id: 'do4', day: 'Do', start: '14:00', end: '21:00', title: 'Aufbau Bühnentechnik + Artistengerüste', type: 'Aufbau', responsiblePersonIds: ['thorsten'], note: 'Gerüste bleiben auf der Bühne und können bis Freitagabend NICHT abgebaut werden. Sarah kommt ~16:00, braucht 2–3 Std. für Mast/Seil + Licht, bekommt 1 Aufbauhilfe.' },
  { id: 'fr1', day: 'Fr', start: '09:30', end: '10:00', title: 'Generalprobe Zwergenorchester', type: 'Probe', responsiblePersonIds: [] },
  { id: 'fr2', day: 'Fr', start: '10:00', end: '12:00', title: 'Generalprobe Instrumentalkreis (notfalls Foyer)', type: 'Probe', responsiblePersonIds: [] },
  { id: 'fr3', day: 'Fr', start: '13:00', end: '18:00', title: 'Proben + Licht-/Tonproben', type: 'Probe', responsiblePersonIds: ['thorsten'], note: 'Ablauf Freitagnachmittag: 13:00 Sketch · 13:30 Eurythmie · 14:00 Breigstreetboys · 14:15 Showband · 15:00 Luftakrobatik (Emmy) · 15:30 Seil/Mast (Sarah) · 16:00 Zauberei (Kay) · 16:30 Zauberei (Sören) · 17:00 Musik (Göbels/Sitter).' },
  { id: 'fr4', day: 'Fr', start: '19:00', end: '23:00', title: 'SHOW', type: 'Show', responsiblePersonIds: ['kay', 'thorsten'] },
  { id: 'fr5', day: 'Fr', start: '23:00', end: '01:00', title: 'Abbau Bühnentechnik', type: 'Abbau', responsiblePersonIds: ['thorsten'] },
  { id: 'sa1', day: 'Sa', start: '10:00', end: '12:00', title: 'Generalprobe Oberstufenorchester', type: 'Probe', responsiblePersonIds: [] },
  { id: 'sa2', day: 'Sa', start: '16:00', end: '18:00', title: 'Konzert', type: 'Sonstiges', responsiblePersonIds: [], note: 'Thorsten/Technik frei – Schulprogramm.' },
];

async function isEmpty(col: string): Promise<boolean> {
  const snap = await getCountFromServer(collection(db, col));
  return snap.data().count === 0;
}

function clean<T extends object>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export async function seedIfEmpty(_uid: string): Promise<boolean> {
  if (!(await isEmpty('people'))) return false;

  const batch = writeBatch(db);
  for (const { id, ...rest } of PEOPLE) batch.set(doc(db, 'people', id), clean(rest));
  for (const { id, ...rest } of BLOCKS) batch.set(doc(db, 'scheduleBlocks', id), clean(rest));
  await batch.commit();
  return true;
}
