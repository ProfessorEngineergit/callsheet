import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { stamp } from './actor';
import type { Act, AppUser, Comment, Note, Person, ScheduleBlock, Task } from '@/types';

// Datenmodell: Top-Level-Sammlungen für eine einzelne Projekt-Instanz.
// (Dokumentiert in README.md – Alternative wäre projects/jubilaeum-75/…)
export const COL = {
  people: 'people',
  acts: 'acts',
  scheduleBlocks: 'scheduleBlocks',
  tasks: 'tasks',
  notes: 'notes',
  comments: 'comments',
  users: 'users',
} as const;

// ---- Users ----
export async function getUserDoc(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, COL.users, uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function createUserDoc(user: AppUser): Promise<void> {
  await setDoc(doc(db, COL.users, user.uid), user, { merge: true });
}

// ---- Tasks ----
export async function createTask(
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL.tasks), {
    ...data,
    createdAt: Date.now(),
    ...stamp(), // updatedAt + updatedBy + updatedByName
  });
  return ref.id;
}

export async function updateTask(id: string, patch: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, COL.tasks, id), { ...patch, ...stamp() });
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.tasks, id));
}

// ---- Acts ----
export async function createAct(data: Omit<Act, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL.acts), data);
  return ref.id;
}
export async function updateAct(id: string, patch: Partial<Act>): Promise<void> {
  await updateDoc(doc(db, COL.acts, id), patch);
}
export async function deleteAct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.acts, id));
}

// ---- ScheduleBlocks ----
export async function createBlock(data: Omit<ScheduleBlock, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL.scheduleBlocks), { ...data, ...stamp() });
  return ref.id;
}
export async function updateBlock(id: string, patch: Partial<ScheduleBlock>): Promise<void> {
  await updateDoc(doc(db, COL.scheduleBlocks, id), { ...patch, ...stamp() });
}
export async function deleteBlock(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.scheduleBlocks, id));
}

// ---- People ----
export async function createPerson(data: Omit<Person, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL.people), data);
  return ref.id;
}
export async function updatePerson(id: string, patch: Partial<Person>): Promise<void> {
  await updateDoc(doc(db, COL.people, id), patch);
}
export async function deletePerson(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.people, id));
}

// ---- Notes ----
export async function createNote(data: Omit<Note, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COL.notes), { ...data, createdAt: Date.now() });
  return ref.id;
}
export async function deleteNote(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.notes, id));
}

// ---- Comments (Feed an Aufgabe oder Zeitplan-Punkt) ----
export async function createComment(
  data: Omit<Comment, 'id' | 'createdAt'>,
): Promise<string> {
  // undefined-Felder rausfiltern (Firestore akzeptiert kein undefined)
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const ref = await addDoc(collection(db, COL.comments), { ...clean, createdAt: Date.now() });
  return ref.id;
}
export async function deleteComment(id: string): Promise<void> {
  await deleteDoc(doc(db, COL.comments, id));
}

export { serverTimestamp };
