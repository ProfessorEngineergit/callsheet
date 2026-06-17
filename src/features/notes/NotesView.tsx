import { useMemo, useState } from 'react';
import { StickyNote, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, Pill, Spinner } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { useData } from '@/store/data';
import { useAuth } from '@/store/auth';
import { createNote, deleteNote } from '@/lib/db';
import { renderMarkdown } from '@/lib/utils';
import type { NoteAttachType } from '@/types';

const FILTERS: { key: NoteAttachType | 'all'; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'general', label: 'Allgemein' },
  { key: 'act', label: 'Programm' },
  { key: 'task', label: 'Aufgabe' },
  { key: 'person', label: 'Person' },
];

export function NotesView() {
  const { notes, loading, personById, actById } = useData();
  const { appUser } = useAuth();
  const [filter, setFilter] = useState<NoteAttachType | 'all'>('all');
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);

  const filtered = useMemo(
    () => notes.filter((n) => filter === 'all' || (n.attachedTo?.type ?? 'general') === filter),
    [notes, filter],
  );

  const submit = async () => {
    if (!draft.trim()) return;
    await createNote({
      body: draft.trim(),
      authorId: appUser?.uid ?? 'unknown',
      attachedTo: { type: 'general' },
    });
    setDraft('');
    setComposing(false);
  };

  const attachLabel = (n: (typeof notes)[number]): string | null => {
    const at = n.attachedTo;
    if (!at || at.type === 'general' || !at.id) return null;
    if (at.type === 'act') return actById(at.id)?.title ?? 'Programm';
    if (at.type === 'person') return personById(at.id)?.name ?? 'Person';
    return at.type;
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Notizen" icon={<StickyNote size={16} />}>
        <button onClick={() => setComposing((c) => !c)} className="btn-primary">
          <Plus size={14} /> <span className="hidden sm:inline">Notiz</span>
        </button>
      </PageHeader>

      <div className="flex gap-1 border-b border-border px-3 py-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              'rounded-md px-2.5 py-1 text-[12px] ' +
              (filter === f.key ? 'bg-hover text-text' : 'text-text-secondary hover:bg-hover')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl">
          {composing && (
            <div className="card mb-4 p-3">
              <textarea
                autoFocus
                className="input min-h-[90px] resize-y"
                placeholder="Notiz (Markdown unterstützt)…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setComposing(false)} className="btn-ghost">
                  Abbrechen
                </button>
                <button onClick={submit} disabled={!draft.trim()} className="btn-primary">
                  Speichern
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<StickyNote size={28} />}
              title="Keine Notizen"
              hint="Halte Absprachen, Ideen und offene Punkte fest."
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => {
                const author = personById(n.authorId);
                const label = attachLabel(n);
                const canDelete = appUser?.role === 'admin' || n.authorId === appUser?.uid;
                return (
                  <div key={n.id} className="card group p-3">
                    <div className="mb-2 flex items-center gap-2 text-[12px] text-text-tertiary">
                      <Avatar name={author?.name ?? n.authorId} color={author?.color} size={18} />
                      <span className="text-text-secondary">{author?.name ?? 'Nutzer'}</span>
                      <span>·</span>
                      <span>{format(n.createdAt, 'd. MMM yyyy, HH:mm', { locale: de })}</span>
                      {label && <Pill>{label}</Pill>}
                      {canDelete && (
                        <button
                          onClick={() => deleteNote(n.id)}
                          className="ml-auto text-text-tertiary opacity-0 transition-opacity hover:text-text group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div
                      className="space-y-1 text-[13px]"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(n.body) }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
