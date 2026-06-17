import { useMemo, useState } from 'react';
import { CheckSquare, LayoutGrid, List, Plus, Filter, X } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, Menu, MenuItem, Pill, Spinner } from '@/components/ui';
import { StatusIcon, PriorityIcon } from '@/components/icons';
import { TaskRow } from './TaskRow';
import { AvatarStack } from '@/components/Avatar';
import { useData } from '@/store/data';
import { useUI } from '@/store/ui';
import { updateTask } from '@/lib/db';
import {
  TASK_STATUS,
  TASK_STATUS_ORDER,
  TASK_PRIORITY,
  TAGS,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';

type ViewMode = 'list' | 'board';

interface Filters {
  assignee?: string;
  tag?: string;
  status?: TaskStatus;
  priority?: string;
  actId?: string;
}

export function TasksView() {
  const { tasks, people, acts, loading } = useData();
  const { setNewTaskOpen, search } = useUI();
  const [mode, setMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<Filters>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (filters.assignee && !t.assigneeIds.includes(filters.assignee)) return false;
        if (filters.tag && !t.tags.includes(filters.tag)) return false;
        if (filters.status && t.status !== filters.status) return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.actId && t.relatedActId !== filters.actId) return false;
        if (q && !(t.title + (t.description ?? '')).toLowerCase().includes(q)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          TASK_PRIORITY[b.priority].rank - TASK_PRIORITY[a.priority].rank ||
          b.updatedAt - a.updatedAt,
      );
  }, [tasks, filters, search]);

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  if (loading) return <Spinner label="Aufgaben laden…" />;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Aufgaben" icon={<CheckSquare size={16} />}>
        <FilterMenu filters={filters} setFilters={setFilters} />
        <div className="flex overflow-hidden rounded-md border border-border">
          <button
            onClick={() => setMode('list')}
            className={cn('px-2 py-1', mode === 'list' ? 'bg-hover text-text' : 'text-text-tertiary')}
            title="Liste"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setMode('board')}
            className={cn('px-2 py-1', mode === 'board' ? 'bg-hover text-text' : 'text-text-tertiary')}
            title="Board"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
        <button onClick={() => setNewTaskOpen(true)} className="btn-primary">
          <Plus size={14} /> <span className="hidden sm:inline">Neu</span>
        </button>
      </PageHeader>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2">
          {activeFilters.map(([key, val]) => (
            <Pill key={key} onRemove={() => setFilters((f) => ({ ...f, [key]: undefined }))}>
              {labelForFilter(key, val as string, people, acts)}
            </Pill>
          ))}
          <button
            onClick={() => setFilters({})}
            className="text-[12px] text-text-tertiary hover:text-text"
          >
            Zurücksetzen
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={28} />}
            title="Keine Aufgaben"
            hint="Erstelle deine erste Aufgabe oder passe die Filter an."
            action={
              <button onClick={() => setNewTaskOpen(true)} className="btn-primary">
                <Plus size={14} /> Neue Aufgabe
              </button>
            }
          />
        ) : mode === 'list' ? (
          <ListView tasks={filtered} />
        ) : (
          <BoardView tasks={filtered} />
        )}
      </div>
    </div>
  );
}

// Listen-Ansicht: gruppiert nach Status.
function ListView({ tasks }: { tasks: Task[] }) {
  return (
    <div>
      {TASK_STATUS_ORDER.map((status) => {
        const group = tasks.filter((t) => t.status === status);
        if (group.length === 0) return null;
        return (
          <div key={status}>
            <div className="flex items-center gap-2 bg-bg px-4 py-1.5 text-[12px] text-text-secondary">
              <StatusIcon status={status} />
              {TASK_STATUS[status].label}
              <span className="text-text-tertiary">{group.length}</span>
            </div>
            {group.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Board-Ansicht: Kanban-Spalten mit HTML5-Drag-and-Drop.
function BoardView({ tasks }: { tasks: Task[] }) {
  const { setOpenTaskId } = useUI();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  const drop = (status: TaskStatus) => {
    if (dragId) {
      const t = tasks.find((x) => x.id === dragId);
      if (t && t.status !== status) updateTask(dragId, { status });
    }
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="flex h-full gap-3 overflow-x-auto p-3">
      {TASK_STATUS_ORDER.map((status) => {
        const group = tasks.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDrop={() => drop(status)}
            className={cn(
              'flex w-[270px] shrink-0 flex-col rounded-lg border border-border bg-panel/40',
              overCol === status && 'ring-1 ring-border',
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2 text-[12px]">
              <StatusIcon status={status} />
              <span className="font-medium">{TASK_STATUS[status].label}</span>
              <span className="text-text-tertiary">{group.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {group.map((t) => (
                <div
                  key={t.id}
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => setOpenTaskId(t.id)}
                  className={cn(
                    'card cursor-pointer space-y-2 p-2.5 hover:border-[#444]',
                    dragId === t.id && 'opacity-40',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <PriorityIcon priority={t.priority} />
                    <div className="flex-1 text-[13px] leading-snug">{t.title}</div>
                  </div>
                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <Pill key={tag}>{tag}</Pill>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-tertiary">
                      {TASK_PRIORITY[t.priority].label}
                    </span>
                    <AvatarStack ids={t.assigneeIds} size={18} />
                  </div>
                </div>
              ))}
              {group.length === 0 && (
                <div className="py-6 text-center text-[11px] text-text-tertiary">Leer</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FilterMenu({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const { people, acts } = useData();
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  return (
    <Menu
      align="right"
      trigger={() => (
        <span className="btn-outline px-2 py-1">
          <Filter size={14} /> <span className="hidden sm:inline">Filter</span>
        </span>
      )}
    >
      {(close) => (
        <div className="max-h-[70vh] w-56 overflow-auto">
          <Section title="Status">
            {TASK_STATUS_ORDER.map((s) => (
              <MenuItem key={s} active={filters.status === s} onClick={() => set({ status: s })}>
                <StatusIcon status={s} /> {TASK_STATUS[s].label}
              </MenuItem>
            ))}
          </Section>
          <Section title="Zuständig">
            {people.map((p) => (
              <MenuItem
                key={p.id}
                active={filters.assignee === p.id}
                onClick={() => set({ assignee: p.id })}
              >
                {p.name}
              </MenuItem>
            ))}
          </Section>
          <Section title="Tag">
            {TAGS.map((t) => (
              <MenuItem key={t} active={filters.tag === t} onClick={() => set({ tag: t })}>
                {t}
              </MenuItem>
            ))}
          </Section>
          <Section title="Programm">
            {acts.map((a) => (
              <MenuItem
                key={a.id}
                active={filters.actId === a.id}
                onClick={() => set({ actId: a.id })}
              >
                {a.title}
              </MenuItem>
            ))}
          </Section>
          <div className="border-t border-border p-1">
            <MenuItem
              onClick={() => {
                setFilters({});
                close();
              }}
            >
              <X size={13} /> Alle Filter löschen
            </MenuItem>
          </div>
        </div>
      )}
    </Menu>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-1">
      <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-text-tertiary">{title}</div>
      {children}
    </div>
  );
}

function labelForFilter(
  key: string,
  val: string,
  people: ReturnType<typeof useData>['people'],
  acts: ReturnType<typeof useData>['acts'],
): string {
  if (key === 'assignee') return people.find((p) => p.id === val)?.name ?? val;
  if (key === 'actId') return acts.find((a) => a.id === val)?.title ?? val;
  if (key === 'status') return TASK_STATUS[val as TaskStatus].label;
  if (key === 'priority') return TASK_PRIORITY[val as keyof typeof TASK_PRIORITY]?.label ?? val;
  return val;
}
