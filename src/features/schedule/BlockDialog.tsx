import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Sheet } from '@/components/ui';
import { createBlock, updateBlock } from '@/lib/db';
import { DAYS, SCHEDULE_TYPE } from '@/lib/constants';
import type { ScheduleBlock, ScheduleDay, ScheduleType } from '@/types';

const TYPES = Object.keys(SCHEDULE_TYPE) as ScheduleType[];

// Dialog zum Anlegen ODER Bearbeiten eines Zeitplan-Eintrags.
export function BlockDialog({
  open,
  onClose,
  day,
  edit,
}: {
  open: boolean;
  onClose: () => void;
  day: ScheduleDay;
  edit?: ScheduleBlock;
}) {
  const [form, setForm] = useState({
    day,
    start: '12:00',
    end: '',
    title: '',
    type: 'Sonstiges' as ScheduleType,
    note: '',
  });

  useEffect(() => {
    if (!open) return;
    if (edit) {
      setForm({
        day: edit.day,
        start: edit.start,
        end: edit.end ?? '',
        title: edit.title,
        type: edit.type,
        note: edit.note ?? '',
      });
    } else {
      setForm({ day, start: '12:00', end: '', title: '', type: 'Sonstiges', note: '' });
    }
  }, [open, edit, day]);

  const save = async () => {
    if (!form.title.trim()) return;
    const payload = {
      day: form.day,
      start: form.start,
      end: form.end || undefined,
      title: form.title.trim(),
      type: form.type,
      note: form.note.trim() || undefined,
      responsiblePersonIds: edit?.responsiblePersonIds ?? [],
    };
    if (edit) await updateBlock(edit.id, payload);
    else await createBlock(payload);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} side="center">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-[14px] font-semibold">
          {edit ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
        </h2>
        <button onClick={onClose} className="text-text-tertiary hover:text-text">
          <X size={17} />
        </button>
      </div>
      <div className="space-y-3 p-4">
        <input
          autoFocus
          className="input"
          placeholder="Titel (z. B. Aufbau Bühne)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[11px] text-text-tertiary">Tag</span>
            <select
              className="input"
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value as ScheduleDay })}
            >
              {DAYS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-tertiary">Art</span>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ScheduleType })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-tertiary">Von</span>
            <input
              type="time"
              className="input"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] text-text-tertiary">Bis (optional)</span>
            <input
              type="time"
              className="input"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </label>
        </div>
        <textarea
          className="input min-h-[60px] resize-y"
          placeholder="Notiz (optional)…"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <button onClick={onClose} className="btn-ghost">
          Abbrechen
        </button>
        <button onClick={save} disabled={!form.title.trim()} className="btn-primary">
          {edit ? 'Speichern' : 'Anlegen'}
        </button>
      </div>
    </Sheet>
  );
}
