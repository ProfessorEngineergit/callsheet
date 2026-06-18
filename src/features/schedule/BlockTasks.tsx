import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { StatusPicker } from '@/features/tasks/controls';
import { AvatarStack } from '@/components/Avatar';
import { useData } from '@/store/data';
import { useUI } from '@/store/ui';
import { useAuth } from '@/store/auth';
import { createTask, updateTask } from '@/lib/db';
import { effectiveAssignees } from '@/lib/schedule';
import { cn } from '@/lib/utils';
import type { ScheduleBlock } from '@/types';

// Aufgaben, die an diesem Zeitplan-Punkt hängen (relatedBlockId).
// Neue Aufgaben werden automatisch mit allen dem Punkt zugeteilten Personen geteilt.
export function BlockTasks({ block }: { block: ScheduleBlock }) {
  const { tasks, people } = useData();
  const { setOpenTaskId } = useUI();
  const { appUser } = useAuth();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  const blockTasks = useMemo(
    () => tasks.filter((t) => t.relatedBlockId === block.id),
    [tasks, block.id],
  );

  const add = async () => {
    if (!title.trim()) return;
    const shareWith = effectiveAssignees(block, people); // mit allen Personen des Punkts teilen
    const id = await createTask({
      title: title.trim(),
      status: 'todo',
      priority: 'keine',
      assigneeIds: shareWith,
      tags: [],
      relatedBlockId: block.id,
      createdBy: appUser?.uid ?? 'unknown',
    });
    setTitle('');
    setAdding(false);
    setOpenTaskId(id);
  };

  return (
    <div className="mt-2 border-t border-border pt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] text-text-secondary">
          Aufgaben{blockTasks.length > 0 ? ` (${blockTasks.length})` : ''}
        </span>
        <button
          onClick={() => setAdding((a) => !a)}
          className="flex items-center gap-1 text-[12px] text-text-secondary hover:text-text"
          title="Aufgabe zu diesem Punkt"
        >
          <Plus size={13} /> Aufgabe
        </button>
      </div>

      {adding && (
        <div className="mb-1.5 flex gap-2">
          <input
            autoFocus
            className="input"
            placeholder="Aufgabe (wird mit allen dieses Punkts geteilt)…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add();
              if (e.key === 'Escape') setAdding(false);
            }}
          />
          <button onClick={add} disabled={!title.trim()} className="btn-primary px-2.5">
            <Plus size={14} />
          </button>
        </div>
      )}

      <div className="space-y-1">
        {blockTasks.map((t) => (
          <div
            key={t.id}
            onClick={() => setOpenTaskId(t.id)}
            className="group flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-hover"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <StatusPicker value={t.status} onChange={(status) => updateTask(t.id, { status })} />
            </div>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-[13px]',
                t.status === 'done' && 'text-text-tertiary line-through',
              )}
            >
              {t.title}
            </span>
            <AvatarStack ids={t.assigneeIds} size={18} />
          </div>
        ))}
      </div>
    </div>
  );
}
