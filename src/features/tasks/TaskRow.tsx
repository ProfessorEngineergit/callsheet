import { format, isPast, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarClock } from 'lucide-react';
import { StatusPicker, PriorityPicker } from './controls';
import { AvatarStack } from '@/components/Avatar';
import { Pill } from '@/components/ui';
import { useUI } from '@/store/ui';
import { updateTask } from '@/lib/db';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

export function TaskRow({ task }: { task: Task }) {
  const { setOpenTaskId } = useUI();
  const overdue =
    task.dueDate && task.status !== 'done' && isPast(parseISO(task.dueDate + 'T23:59:59'));

  return (
    <div
      onClick={() => setOpenTaskId(task.id)}
      className="group flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2 hover:bg-hover"
    >
      <div onClick={(e) => e.stopPropagation()}>
        <PriorityPicker value={task.priority} onChange={(priority) => updateTask(task.id, { priority })} />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <StatusPicker value={task.status} onChange={(status) => updateTask(task.id, { status })} />
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 truncate',
          task.status === 'done' && 'text-text-tertiary line-through',
        )}
      >
        {task.title}
      </div>
      <div className="hidden items-center gap-1.5 sm:flex">
        {task.tags.slice(0, 2).map((t) => (
          <Pill key={t}>{t}</Pill>
        ))}
      </div>
      {task.dueDate && (
        <div
          className={cn(
            'hidden items-center gap-1 text-[12px] sm:flex',
            overdue ? 'text-status-blocked' : 'text-text-tertiary',
          )}
        >
          <CalendarClock size={12} />
          {format(parseISO(task.dueDate), 'd. MMM', { locale: de })}
        </div>
      )}
      <AvatarStack ids={task.assigneeIds} size={20} />
    </div>
  );
}
