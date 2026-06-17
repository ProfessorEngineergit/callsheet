// Befüllt Firestore direkt aus dem Browser (kein Service-Account nötig).
// Wird nur aufgerufen, wenn die Datenbank leer ist.
import { collection, doc, getCountFromServer, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const now = Date.now();

const PEOPLE = [
  { id: 'kay',          name: 'Kay Schmid',            tags: ['Orga','Schule','Leitung'], role: 'admin',  email: 'kschmid@waldorfschule-frankfurt.de', phone: undefined,         color: '#4A4A4A', initials: 'KS' },
  { id: 'thorsten',     name: 'Thorsten Hochhaus',     tags: ['Technik'],                 role: 'member', email: 'th@freiraum-erleben.com',            phone: '+49 163 7459361', color: '#606060', initials: 'TH' },
  { id: 'sarah',        name: 'Sarah Lindermayer',     tags: ['Artistik'],                role: 'member', email: 'info@sarah-lindermayer.de',          phone: '0175 7163796',   color: '#757575', initials: 'SL' },
  { id: 'emmy',         name: 'Emmy Levedag',          tags: ['Artistik'],                role: 'member', email: 'emmy.levedag@icloud.com',            phone: undefined,         color: '#8A8A8A', initials: 'EL' },
  { id: 'julia',        name: 'Julia Janke',           tags: ['Orga'],                    role: 'member', email: 'juliajanke@googlemail.com',           phone: undefined,         color: '#9E9E9E', initials: 'JJ' },
  { id: 'ele',          name: 'Ele',                   tags: ['Orga'],                    role: 'member', email: 'eljaele@googlemail.com',              phone: undefined,         color: '#B3B3B3', initials: 'EL' },
  { id: 'jasper',       name: 'Jasper Janke',          tags: ['Orga','Artistik'],         role: 'member', email: 'jasper.janke@gmx.de',                phone: undefined,         color: '#383838', initials: 'JJ' },
  { id: 'soeren',       name: 'Sören Pohl',            tags: ['Zauberei'],                role: 'member', email: undefined,                             phone: undefined,         color: '#525252', initials: 'SP' },
  { id: 'buehnentechnik', name: 'Bühnentechnik (Schule)', tags: ['Technik','Schule'],    role: 'member', email: 'technik@waldorfschule-frankfurt.de',  phone: undefined,         color: '#4A4A4A', initials: 'BT' },
];

const ACTS = [
  { id: 'act1', order: 1, rehearsalTime: '13:00', title: 'Sketch',          performers: ['Schüler'],        category: 'Sketch',    requirements: ['Headsets','Ton'],          status: 'geplant' },
  { id: 'act2', order: 2, rehearsalTime: '13:30', title: 'Eurythmie',       performers: ['Basfeld/Reymann'],category: 'Eurythmie', requirements: [],                          status: 'geplant' },
  { id: 'act3', order: 3, rehearsalTime: '14:00', title: 'Breigstreetboys', performers: ['Breigstreetboys'],category: 'Musik',     requirements: [],                          status: 'geplant' },
  { id: 'act4', order: 4, rehearsalTime: '14:15', title: 'Showband',        performers: ['Showband'],        category: 'Musik',     requirements: ['Sound'],                   status: 'geplant' },
  { id: 'act5', order: 5, rehearsalTime: '15:00', title: 'Luftakrobatik',   performers: ['emmy'],            category: 'Artistik',  requirements: ['Gerüst','Rigging'],        status: 'geplant' },
  { id: 'act6', order: 6, rehearsalTime: '15:30', title: 'Seil/Mast',       performers: ['sarah'],           category: 'Artistik',  requirements: ['Mast/Seil','Licht'],       status: 'geplant' },
  { id: 'act7', order: 7, rehearsalTime: '16:00', title: 'Zauberei',        performers: ['kay'],             category: 'Zauberei',  requirements: [],                          status: 'geplant' },
  { id: 'act8', order: 8, rehearsalTime: '16:30', title: 'Zauberei',        performers: ['soeren'],          category: 'Zauberei',  requirements: [],                          status: 'geplant' },
  { id: 'act9', order: 9, rehearsalTime: '17:00', title: 'Musik',           performers: ['Göbels/Sitter'],   category: 'Musik',     requirements: [],                          status: 'geplant' },
];

const BLOCKS = [
  { id: 'mi1', day: 'Mi', start: '14:00', end: undefined,  title: 'Aufbau Bühnentechnik für die Monatsfeier',           type: 'Aufbau',    responsiblePersonIds: ['buehnentechnik'], uncertain: true,  note: 'Beginn „ab 14 Uhr" noch unbestätigt.' },
  { id: 'do1', day: 'Do', start: '08:00', end: '09:00',    title: 'Probe Instrumentalkreis',                            type: 'Probe',     responsiblePersonIds: [],                 uncertain: false, note: undefined },
  { id: 'do2', day: 'Do', start: '10:00', end: '11:30',    title: 'Monatsfeier',                                        type: 'Sonstiges', responsiblePersonIds: [],                 uncertain: false, note: undefined },
  { id: 'do3', day: 'Do', start: '12:00', end: '14:00',    title: 'Probe Oberstufenorchester',                          type: 'Probe',     responsiblePersonIds: [],                 uncertain: false, note: undefined },
  { id: 'do4', day: 'Do', start: '14:00', end: '21:00',    title: 'Aufbau Bühnentechnik + Artistengerüste',             type: 'Aufbau',    responsiblePersonIds: ['thorsten'],       uncertain: false, note: 'Gerüste bleiben auf der Bühne und können bis Freitagabend NICHT abgebaut werden. Sarah kommt ~16:00, braucht 2–3 Std. für Mast/Seil + Licht, bekommt 1 Aufbauhilfe.' },
  { id: 'fr1', day: 'Fr', start: '09:30', end: '10:00',    title: 'Generalprobe Zwergenorchester',                      type: 'Probe',     responsiblePersonIds: [],                 uncertain: false, note: undefined },
  { id: 'fr2', day: 'Fr', start: '10:00', end: '12:00',    title: 'Generalprobe Instrumentalkreis (notfalls Foyer)',    type: 'Probe',     responsiblePersonIds: [],                 uncertain: false, note: undefined },
  { id: 'fr3', day: 'Fr', start: '13:00', end: '18:00',    title: 'Proben + Licht-/Tonproben (Ablaufplan siehe Programm)', type: 'Probe', responsiblePersonIds: ['thorsten'],       uncertain: false, note: undefined },
  { id: 'fr4', day: 'Fr', start: '19:00', end: '23:00',    title: 'SHOW',                                               type: 'Show',      responsiblePersonIds: ['kay','thorsten'], uncertain: false, note: undefined },
  { id: 'fr5', day: 'Fr', start: '23:00', end: '01:00',    title: 'Abbau Bühnentechnik',                                type: 'Abbau',     responsiblePersonIds: ['thorsten'],       uncertain: false, note: undefined },
  { id: 'sa1', day: 'Sa', start: '10:00', end: '12:00',    title: 'Generalprobe Oberstufenorchester',                   type: 'Probe',     responsiblePersonIds: [],                 uncertain: false, note: undefined },
  { id: 'sa2', day: 'Sa', start: '16:00', end: '18:00',    title: 'Konzert',                                            type: 'Sonstiges', responsiblePersonIds: [],                 uncertain: false, note: 'Thorsten/Technik frei – Schulprogramm.' },
];

const TASKS = [
  { id: 'task1', title: 'Mittwoch-Aufbau „ab 14 Uhr" verbindlich bestätigen', description: 'Von Kay selbst mit ???? markiert.', status: 'blocked',  priority: 'mittel',   assigneeIds: ['kay'],            tags: ['Orga','Technik'], relatedBlockId: 'mi1', relatedActId: undefined },
  { id: 'task2', title: 'Videoaufzeichnung: Tonsumme für die Aufzeichner?',    description: 'Kontakt herstellen.',                status: 'todo',     priority: 'mittel',   assigneeIds: ['thorsten','kay'], tags: ['Technik'],         relatedBlockId: undefined, relatedActId: undefined },
  { id: 'task3', title: 'LED-Wand: Idle-Content entscheiden',                  description: 'Vorschlag: PPT-Slideshow mit Infos/Bildern.', status: 'todo', priority: 'niedrig', assigneeIds: ['thorsten'],       tags: ['Technik','Orga'],  relatedBlockId: undefined, relatedActId: undefined },
  { id: 'task4', title: 'CEE-Kabel-Bedarf für LED-Wand klären',               description: 'Thorsten kann Ersatz mitbringen.',   status: 'todo',     priority: 'niedrig',  assigneeIds: ['thorsten'],       tags: ['Technik'],         relatedBlockId: undefined, relatedActId: undefined },
  { id: 'task5', title: 'Gerüst-Abbau in der Pause: Helfer aus Ele/Julia-Gruppe?', description: undefined,                       status: 'todo',     priority: 'mittel',   assigneeIds: ['julia','kay'],    tags: ['Orga','Artistik'], relatedBlockId: undefined, relatedActId: undefined },
  { id: 'task6', title: 'Aufbauhilfe für Sarah (Do ab 16:00) zuteilen',       description: undefined,                            status: 'todo',     priority: 'mittel',   assigneeIds: ['kay'],            tags: ['Orga','Artistik'], relatedBlockId: 'do4',  relatedActId: 'act6' },
  { id: 'task7', title: 'Verbindliches Show-Datum festlegen',                  description: 'Der Verlauf nennt nur Wochentage Mi–Sa, kein Kalenderdatum.', status: 'todo', priority: 'hoch', assigneeIds: ['kay'], tags: ['Orga'], relatedBlockId: undefined, relatedActId: undefined },
];

async function isEmpty(col: string): Promise<boolean> {
  const snap = await getCountFromServer(collection(db, col));
  return snap.data().count === 0;
}

export async function seedIfEmpty(uid: string): Promise<boolean> {
  if (!(await isEmpty('people'))) return false; // already seeded

  const batch = writeBatch(db);

  for (const { id, ...rest } of PEOPLE) {
    // Undefined-Felder rausfiltern, Firestore mag kein undefined
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
    batch.set(doc(db, 'people', id), clean);
  }
  for (const { id, ...rest } of ACTS) {
    batch.set(doc(db, 'acts', id), rest);
  }
  for (const { id, ...rest } of BLOCKS) {
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
    batch.set(doc(db, 'scheduleBlocks', id), clean);
  }
  for (const { id, ...rest } of TASKS) {
    const clean = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
    batch.set(doc(db, 'tasks', id), { ...clean, createdAt: now, updatedAt: now, createdBy: uid });
  }

  await batch.commit();
  return true;
}
