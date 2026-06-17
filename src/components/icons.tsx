import { Circle, CircleDot, CircleCheck, CircleSlash, type LucideIcon } from 'lucide-react';
import { TASK_PRIORITY, TASK_STATUS } from '@/lib/constants';
import type { TaskPriority, TaskStatus } from '@/types';

const STATUS_ICON: Record<TaskStatus, LucideIcon> = {
  todo: Circle,
  in_progress: CircleDot,
  blocked: CircleSlash,
  done: CircleCheck,
};

export function StatusIcon({ status, size = 14 }: { status: TaskStatus; size?: number }) {
  const Icon = STATUS_ICON[status];
  return <Icon size={size} style={{ color: TASK_STATUS[status].color }} className="shrink-0" />;
}

// Prioritäts-Balken (Linear-Stil): 3 ansteigende Striche.
export function PriorityIcon({ priority, size = 14 }: { priority: TaskPriority; size?: number }) {
  const { rank, color } = TASK_PRIORITY[priority];
  if (priority === 'keine') {
    return (
      <span
        className="inline-flex items-center justify-center text-text-tertiary"
        style={{ width: size, height: size }}
        title="Keine Priorität"
      >
        <span className="block h-[2px] w-2.5 rounded bg-current opacity-50" />
      </span>
    );
  }
  const heights = [0.4, 0.65, 1];
  return (
    <span
      className="inline-flex items-end gap-[2px]"
      style={{ height: size }}
      title={TASK_PRIORITY[priority].label}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px]"
          style={{
            height: `${h * size}px`,
            background: i < rank ? color : '#2c2e33',
          }}
        />
      ))}
    </span>
  );
}
