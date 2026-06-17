import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { COL } from '@/lib/db';
import type { Act, AppUser, Note, Person, ScheduleBlock, Task } from '@/types';

interface DataState {
  people: Person[];
  acts: Act[];
  blocks: ScheduleBlock[];
  tasks: Task[];
  notes: Note[];
  users: AppUser[];
  loading: boolean;
  personById: (id: string) => Person | undefined;
  actById: (id: string) => Act | undefined;
  blockById: (id: string) => ScheduleBlock | undefined;
}

const DataContext = createContext<DataState | null>(null);

// Zentraler Echtzeit-Datenkontext: abonniert alle Sammlungen via onSnapshot.
export function DataProvider({ children }: { children: ReactNode }) {
  const people = useCollection<Person>(COL.people);
  const acts = useCollection<Act>(COL.acts);
  const blocks = useCollection<ScheduleBlock>(COL.scheduleBlocks);
  const tasks = useCollection<Task>(COL.tasks);
  const notes = useCollection<Note>(COL.notes);
  const users = useCollection<AppUser & { id: string }>(COL.users);

  const value = useMemo<DataState>(() => {
    const peopleMap = new Map(people.data.map((p) => [p.id, p]));
    const actsMap = new Map(acts.data.map((a) => [a.id, a]));
    const blocksMap = new Map(blocks.data.map((b) => [b.id, b]));
    return {
      people: people.data,
      acts: [...acts.data].sort((a, b) => a.order - b.order),
      blocks: blocks.data,
      tasks: tasks.data,
      notes: [...notes.data].sort((a, b) => b.createdAt - a.createdAt),
      users: users.data,
      loading: people.loading || acts.loading || blocks.loading || tasks.loading,
      personById: (id) => peopleMap.get(id),
      actById: (id) => actsMap.get(id),
      blockById: (id) => blocksMap.get(id),
    };
  }, [people, acts, blocks, tasks, notes, users]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
