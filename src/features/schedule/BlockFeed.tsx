import { useMemo, useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Avatar } from '@/components/Avatar';
import { useCollection } from '@/hooks/useCollection';
import { useAuth } from '@/store/auth';
import { useData } from '@/store/data';
import { COL, createComment, deleteComment } from '@/lib/db';
import type { Comment } from '@/types';

// Nachrichten-Feed an einem Zeitplan-Punkt: „Ich kümmere mich drum" usw.
export function BlockFeed({ blockId }: { blockId: string }) {
  const { appUser } = useAuth();
  const { personById } = useData();
  const { data } = useCollection<Comment>(COL.comments);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');

  const messages = useMemo(
    () =>
      data
        .filter((c) => c.blockId === blockId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [data, blockId],
  );

  const send = async () => {
    if (!body.trim()) return;
    await createComment({
      blockId,
      authorId: appUser?.uid ?? 'unknown',
      authorName: appUser?.name ?? 'Nutzer',
      body: body.trim(),
    });
    setBody('');
    setOpen(true);
  };

  const quick = async (text: string) => {
    await createComment({
      blockId,
      authorId: appUser?.uid ?? 'unknown',
      authorName: appUser?.name ?? 'Nutzer',
      body: text,
    });
    setOpen(true);
  };

  return (
    <div className="mt-2 border-t border-border pt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text"
      >
        <MessageSquare size={13} />
        {messages.length > 0 ? `${messages.length} Nachricht${messages.length === 1 ? '' : 'en'}` : 'Nachricht schreiben'}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {messages.map((m) => {
            const author = personById(m.authorId);
            const name = m.authorName ?? author?.name ?? 'Nutzer';
            const mine = m.authorId === appUser?.uid;
            return (
              <div key={m.id} className="group flex gap-2">
                <Avatar name={name} color={author?.color} size={20} />
                <div className="min-w-0 flex-1 rounded-md bg-bg px-2.5 py-1.5">
                  <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                    <span className="text-text-secondary">{name}</span>
                    <span>{format(m.createdAt, 'd. MMM HH:mm', { locale: de })}</span>
                    {mine && (
                      <button
                        onClick={() => deleteComment(m.id)}
                        className="ml-auto opacity-0 transition-opacity hover:text-status-blocked group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap text-[13px]">{m.body}</div>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5">
              {['Ich kümmere mich drum', 'Bin dabei', 'Brauche Hilfe'].map((q) => (
                <button
                  key={q}
                  onClick={() => quick(q)}
                  className="pill cursor-pointer hover:text-text"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Nachricht…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} disabled={!body.trim()} className="btn-outline px-2.5">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
