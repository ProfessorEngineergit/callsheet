import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { COL } from '@/lib/db';
import type { AppUser, Person, ScheduleBlock, Task } from '@/types';

interface DataState {
  people: Person[];
  blocks: ScheduleBlock[];
  tasks: Task[];
  users: AppUser[];
  loading: boolean;
  personById: (id: string) => Person | undefined;
  blockById: (id: string) => ScheduleBlock | undefined;
}

const DataContext = createContext<DataState | null>(null);

// Zentraler Echtzeit-Datenkontext: abonniert alle Sammlungen via onSnapshot.
export function DataProvider({ children }: { children: ReactNode }) {
  const people = useCollection<Person>(COL.people);
  const blocks = useCollection<ScheduleBlock>(COL.scheduleBlocks);
  const tasks = useCollection<Task>(COL.tasks);
  const users = useCollection<AppUser & { id: string }>(COL.users);

  const value = useMemo<DataState>(() => {
    const peopleMap = new Map(people.data.map((p) => [p.id, p]));
    const blocksMap = new Map(blocks.data.map((b) => [b.id, b]));
    return {
      people: people.data,
      blocks: blocks.data,
      tasks: tasks.data,
      users: users.data,
      loading: people.loading || blocks.loading || tasks.loading,
      personById: (id) => peopleMap.get(id),
      blockById: (id) => blocksMap.get(id),
    };
  }, [people, blocks, tasks, users]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataState {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
