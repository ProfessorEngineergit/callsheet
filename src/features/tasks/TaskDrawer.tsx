import { useEffect, useMemo, useState } from 'react';
import { Trash2, X, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Sheet, MenuItem, Menu } from '@/components/ui';
import { StatusPicker, PriorityPicker, AssigneePicker, TagPicker } from './controls';
import { TASK_STATUS, TASK_PRIORITY } from '@/lib/constants';
import { renderMarkdown } from '@/lib/utils';
import { useUI } from '@/store/ui';
import { useAuth } from '@/store/auth';
import { useData } from '@/store/data';
import { useCollection } from '@/hooks/useCollection';
import { COL, deleteTask, updateTask } from '@/lib/db';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar } from '@/components/Avatar';
import type { Comment, Task } from '@/types';

export function TaskDrawer() {
  const { openTaskId, setOpenTaskId } = useUI();
  const { appUser } = useAuth();
  const { tasks, acts, blocks, actById, blockById, personById } = useData();
  const task = tasks.find((t) => t.id === openTaskId);

  const close = () => setOpenTaskId(null);
  const patch = (p: Partial<Task>) => task && updateTask(task.id, p);

  return (
    <Sheet open={Boolean(task)} onClose={close} side="right">
      {task && (
        <>
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2 text-text-tertiary">
              <span className="text-[12px]">Aufgabe</span>
              {appUser?.role === 'admin' && (
                <button
                  onClick={async () => {
                    await deleteTask(task.id);
                    close();
                  }}
                  className="text-text-tertiary hover:text-status-blocked"
                  title="Löschen (Admin)"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <button onClick={close} className="text-text-tertiary hover:text-text">
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4 p-4">
              <TitleEditor task={task} onSave={(title) => patch({ title })} />
              <DescriptionEditor task={task} onSave={(description) => patch({ description })} />
            </div>

            <div className="space-y-3 border-t border-border p-4 text-[13px]">
              <Row label="Status">
                <span className="flex items-center gap-2">
                  <StatusPicker value={task.status} onChange={(status) => patch({ status })} />
                  {TASK_STATUS[task.status].label}
                </span>
              </Row>
              <Row label="Priorität">
                <span className="flex items-center gap-2">
                  <PriorityPicker
                    value={task.priority}
                    onChange={(priority) => patch({ priority })}
                  />
                  {TASK_PRIORITY[task.priority].label}
                </span>
              </Row>
              <Row label="Zuständig">
                <AssigneePicker
                  value={task.assigneeIds}
                  onChange={(assigneeIds) => patch({ assigneeIds })}
                />
              </Row>
              <Row label="Fällig">
                <input
                  type="date"
                  className="input w-auto"
                  value={task.dueDate ?? ''}
                  onChange={(e) => patch({ dueDate: e.target.value || undefined })}
                />
              </Row>
              <Row label="Tags">
                <TagPicker value={task.tags} onChange={(tags) => patch({ tags })} />
              </Row>
              <Row label="Programm">
                <RelationPicker
                  current={task.relatedActId}
                  options={acts.map((a) => ({ id: a.id, label: a.title }))}
                  currentLabel={task.relatedActId ? actById(task.relatedActId)?.title : undefined}
                  onChange={(relatedActId) => patch({ relatedActId })}
                />
              </Row>
              <Row label="Zeitblock">
                <RelationPicker
                  current={task.relatedBlockId}
                  options={blocks.map((b) => ({ id: b.id, label: `${b.day} ${b.start} · ${b.title}` }))}
                  currentLabel={
                    task.relatedBlockId
                      ? (() => {
                          const b = blockById(task.relatedBlockId);
                          return b ? `${b.day} ${b.start} · ${b.title}` : undefined;
                        })()
                      : undefined
                  }
                  onChange={(relatedBlockId) => patch({ relatedBlockId })}
                />
              </Row>
            </div>

            <Comments taskId={task.id} />
          </div>
        </>
      )}
    </Sheet>
  );

  function RelationPicker({
    current,
    currentLabel,
    options,
    onChange,
  }: {
    current?: string;
    currentLabel?: string;
    options: { id: string; label: string }[];
    onChange: (id?: string) => void;
  }) {
    return (
      <Menu
        trigger={() => (
          <span className="flex items-center gap-1.5 text-text-secondary hover:text-text">
            <Link2 size={13} />
            {currentLabel ?? <span className="text-text-tertiary">Verknüpfen…</span>}
          </span>
        )}
      >
        {(close) => (
          <div className="max-h-64 overflow-auto">
            <MenuItem
              onClick={() => {
                onChange(undefined);
                close();
              }}
              active={!current}
            >
              Keine
            </MenuItem>
            {options.map((o) => (
              <MenuItem
                key={o.id}
                active={o.id === current}
                onClick={() => {
                  onChange(o.id);
                  close();
                }}
              >
                {o.label}
              </MenuItem>
            ))}
          </div>
        )}
      </Menu>
    );
  }

  function Comments({ taskId }: { taskId: string }) {
    const { data } = useCollection<Comment>(COL.comments);
    const comments = useMemo(
      () => data.filter((c) => c.taskId === taskId).sort((a, b) => a.createdAt - b.createdAt),
      [data, taskId],
    );
    const [body, setBody] = useState('');

    const send = async () => {
      if (!body.trim()) return;
      await addDoc(collection(db, COL.comments), {
        taskId,
        authorId: appUser?.uid ?? 'unknown',
        body: body.trim(),
        createdAt: Date.now(),
      });
      setBody('');
    };

    return (
      <div className="border-t border-border p-4">
        <div className="mb-2 text-[12px] font-medium text-text-secondary">Aktivität</div>
        <div className="space-y-3">
          {comments.map((c) => {
            const author = personById(c.authorId);
            return (
              <div key={c.id} className="flex gap-2">
                <Avatar name={author?.name ?? c.authorId} color={author?.color} size={20} />
                <div className="min-w-0">
                  <div className="text-[12px] text-text-secondary">
                    {author?.name ?? 'Nutzer'} ·{' '}
                    {format(c.createdAt, 'd. MMM HH:mm', { locale: de })}
                  </div>
                  <div className="whitespace-pre-wrap">{c.body}</div>
                </div>
              </div>
            );
          })}
          {comments.length === 0 && (
            <div className="text-[12px] text-text-tertiary">Noch keine Kommentare.</div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder="Kommentar schreiben…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button onClick={send} className="btn-outline">
            Senden
          </button>
        </div>
      </div>
    );
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-24 shrink-0 pt-0.5 text-text-tertiary">{label}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function TitleEditor({ task, onSave }: { task: Task; onSave: (v: string) => void }) {
  const [val, setVal] = useState(task.title);
  useEffect(() => setVal(task.title), [task.id, task.title]);
  return (
    <textarea
      className="w-full resize-none bg-transparent text-[18px] font-semibold leading-tight placeholder:text-text-tertiary focus:outline-none"
      rows={Math.max(1, Math.ceil(val.length / 38))}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => val.trim() && val !== task.title && onSave(val.trim())}
    />
  );
}

function DescriptionEditor({ task, onSave }: { task: Task; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(task.description ?? '');
  useEffect(() => setVal(task.description ?? ''), [task.id, task.description]);

  if (editing) {
    return (
      <textarea
        autoFocus
        className="input min-h-[120px] resize-y"
        value={val}
        placeholder="Beschreibung (Markdown)…"
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (val !== (task.description ?? '')) onSave(val);
        }}
      />
    );
  }
  return (
    <div
      onClick={() => setEditing(true)}
      className="prose-sm min-h-[40px] cursor-text rounded-md text-text-secondary"
    >
      {task.description ? (
        <div
          className="space-y-1 text-text"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(task.description) }}
        />
      ) : (
        <span className="text-text-tertiary">Beschreibung hinzufügen…</span>
      )}
    </div>
  );
}
