import { Check } from 'lucide-react';
import { Menu, MenuItem, Pill } from '@/components/ui';
import { StatusIcon, PriorityIcon } from '@/components/icons';
import { Avatar } from '@/components/Avatar';
import {
  TASK_STATUS,
  TASK_STATUS_ORDER,
  TASK_PRIORITY,
  TASK_PRIORITY_ORDER,
  TAGS,
} from '@/lib/constants';
import { useData } from '@/store/data';
import type { TaskPriority, TaskStatus } from '@/types';

export function StatusPicker({
  value,
  onChange,
}: {
  value: TaskStatus;
  onChange: (s: TaskStatus) => void;
}) {
  return (
    <Menu trigger={() => <StatusIcon status={value} size={16} />}>
      {(close) => (
        <>
          {TASK_STATUS_ORDER.map((s) => (
            <MenuItem
              key={s}
              active={s === value}
              onClick={() => {
                onChange(s);
                close();
              }}
            >
              <StatusIcon status={s} /> {TASK_STATUS[s].label}
              {s === value && <Check size={13} className="ml-auto text-accent" />}
            </MenuItem>
          ))}
        </>
      )}
    </Menu>
  );
}

export function PriorityPicker({
  value,
  onChange,
}: {
  value: TaskPriority;
  onChange: (p: TaskPriority) => void;
}) {
  return (
    <Menu trigger={() => <PriorityIcon priority={value} size={15} />}>
      {(close) => (
        <>
          {TASK_PRIORITY_ORDER.map((p) => (
            <MenuItem
              key={p}
              active={p === value}
              onClick={() => {
                onChange(p);
                close();
              }}
            >
              <PriorityIcon priority={p} /> {TASK_PRIORITY[p].label}
              {p === value && <Check size={13} className="ml-auto text-accent" />}
            </MenuItem>
          ))}
        </>
      )}
    </Menu>
  );
}

export function AssigneePicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const { people } = useData();
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <Menu
      trigger={() => (
        <span className="flex items-center gap-1.5 text-text-secondary hover:text-text">
          {value.length === 0 ? (
            <span className="text-text-tertiary">Zuweisen…</span>
          ) : (
            <span className="flex -space-x-1.5">
              {value.slice(0, 5).map((id) => {
                const p = people.find((x) => x.id === id);
                return (
                  <span key={id} className="rounded-full ring-1 ring-panel">
                    <Avatar name={p?.name ?? id} color={p?.color} initials={p?.initials} size={20} />
                  </span>
                );
              })}
            </span>
          )}
        </span>
      )}
    >
      {() => (
        <div className="max-h-64 overflow-auto">
          {people.map((p) => (
            <MenuItem key={p.id} active={value.includes(p.id)} onClick={() => toggle(p.id)}>
              <Avatar name={p.name} color={p.color} initials={p.initials} size={18} /> {p.name}
              {value.includes(p.id) && <Check size={13} className="ml-auto text-accent" />}
            </MenuItem>
          ))}
        </div>
      )}
    </Menu>
  );
}

export function TagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const toggle = (t: string) =>
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {value.map((t) => (
        <Pill key={t} onRemove={() => toggle(t)}>
          {t}
        </Pill>
      ))}
      <Menu trigger={() => <span className="pill cursor-pointer hover:text-text">+ Tag</span>}>
        {() => (
          <>
            {TAGS.map((t) => (
              <MenuItem key={t} active={value.includes(t)} onClick={() => toggle(t)}>
                {t}
                {value.includes(t) && <Check size={13} className="ml-auto text-accent" />}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </div>
  );
}
