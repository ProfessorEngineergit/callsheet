import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Sheet } from '@/components/ui';
import { StatusPicker, PriorityPicker, AssigneePicker, TagPicker } from './controls';
import { useUI } from '@/store/ui';
import { useAuth } from '@/store/auth';
import { createTask } from '@/lib/db';
import type { TaskPriority, TaskStatus } from '@/types';

const EMPTY = {
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'keine' as TaskPriority,
  assigneeIds: [] as string[],
  tags: [] as string[],
  dueDate: '',
};

export function NewTaskDialog() {
  const { newTaskOpen, setNewTaskOpen, setOpenTaskId } = useUI();
  const { appUser } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (newTaskOpen) setForm(EMPTY);
  }, [newTaskOpen]);

  const submit = async () => {
    if (!form.title.trim() || busy) return;
    setBusy(true);
    try {
      const id = await createTask({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        priority: form.priority,
        assigneeIds: form.assigneeIds,
        tags: form.tags,
        dueDate: form.dueDate || undefined,
        createdBy: appUser?.uid ?? 'unknown',
      });
      setNewTaskOpen(false);
      setOpenTaskId(id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={newTaskOpen} onClose={() => setNewTaskOpen(false)} side="center">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[14px] font-semibold">Neue Aufgabe</h2>
        <button onClick={() => setNewTaskOpen(false)} className="text-text-tertiary hover:text-text">
          <X size={17} />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto p-4">
        <input
          autoFocus
          className="w-full bg-transparent text-[16px] font-medium placeholder:text-text-tertiary focus:outline-none"
          placeholder="Aufgabentitel"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
        />
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="Beschreibung (Markdown)…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex flex-wrap items-center gap-2 border-y border-border py-3">
          <span className="btn-outline px-2 py-1">
            <StatusPicker
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
            />
          </span>
          <span className="btn-outline px-2 py-1">
            <PriorityPicker
              value={form.priority}
              onChange={(priority) => setForm({ ...form, priority })}
            />
          </span>
          <span className="btn-outline px-2 py-1">
            <AssigneePicker
              value={form.assigneeIds}
              onChange={(assigneeIds) => setForm({ ...form, assigneeIds })}
            />
          </span>
          <input
            type="date"
            className="input w-auto"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>

        <TagPicker value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
        <button onClick={() => setNewTaskOpen(false)} className="btn-ghost">
          Abbrechen
        </button>
        <button onClick={submit} disabled={!form.title.trim() || busy} className="btn-primary">
          Erstellen
        </button>
      </div>
    </Sheet>
  );
}
