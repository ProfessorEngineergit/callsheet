import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, CalendarClock, AlertTriangle, ListTodo, ArrowRight, Database } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { Spinner } from '@/components/ui';
import { TaskRow } from '@/features/tasks/TaskRow';
import { useData } from '@/store/data';
import { useAuth } from '@/store/auth';
import { DAYS, SCHEDULE_TYPE } from '@/lib/constants';
import { AvatarStack } from '@/components/Avatar';
import { seedIfEmpty } from '@/lib/browserSeed';

export function InboxView() {
  const { tasks, blocks, people, loading } = useData();
  const { appUser } = useAuth();
  const navigate = useNavigate();

  // Verknüpft den eingeloggten Nutzer über die E-Mail mit einer Person.
  const myPersonId = useMemo(
    () => people.find((p) => p.email && p.email === appUser?.email)?.id,
    [people, appUser],
  );

  const mine = tasks.filter(
    (t) => myPersonId && t.assigneeIds.includes(myPersonId) && t.status !== 'done',
  );
  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== 'done' && isPast(parseISO(t.dueDate + 'T23:59:59')),
  );
  const open = tasks
    .filter((t) => t.status !== 'done')
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const upcoming = blocks
    .filter((b) => b.type === 'Show' || b.type === 'Aufbau' || b.type === 'Abbau')
    .sort((a, b) => DAYS.findIndex((d) => d.key === a.day) - DAYS.findIndex((d) => d.key === b.day) || a.start.localeCompare(b.start));

  const [seeding, setSeeding] = useState(false);
  const handleSeed = async () => {
    setSeeding(true);
    await seedIfEmpty(appUser?.uid ?? 'unknown');
    setSeeding(false);
  };

  if (loading) return <Spinner label="Lädt…" />;

  // Datenbank leer → Seed-Button anzeigen
  if (!loading && tasks.length === 0 && people.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Inbox" icon={<Inbox size={16} />} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Database size={32} className="text-text-tertiary" />
          <div className="text-[15px] font-medium">Keine Daten vorhanden</div>
          <p className="max-w-xs text-text-secondary">
            Die Datenbank ist leer. Lade die Ausgangsdaten (Team, Programm, Zeitplan, Aufgaben) mit einem Klick.
          </p>
          <button onClick={handleSeed} disabled={seeding} className="btn-primary mt-2">
            {seeding ? 'Wird geladen…' : 'Initialdaten laden'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Inbox" icon={<Inbox size={16} />}>
        <span className="text-[12px] text-text-tertiary">
          Hallo {appUser?.name?.split(' ')[0] ?? ''} 👋
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Offen" value={open.length} color="#9598A1" />
            <Stat label="Überfällig" value={overdue.length} color="#C0C0C0" />
            <Stat label="Mir zugewiesen" value={mine.length} color="#E6E7EA" />
          </div>

          <Section
            icon={<ListTodo size={14} />}
            title="Mir zugewiesen"
            onAll={() => navigate('/tasks')}
          >
            {mine.length === 0 ? (
              <Hint>
                {myPersonId
                  ? 'Dir sind aktuell keine offenen Aufgaben zugewiesen.'
                  : 'Dein Login ist noch keiner Person zugeordnet (E-Mail-Abgleich). Lege im Team eine Person mit deiner E-Mail an.'}
              </Hint>
            ) : (
              mine.map((t) => <TaskRow key={t.id} task={t} />)
            )}
          </Section>

          {overdue.length > 0 && (
            <Section icon={<AlertTriangle size={14} className="text-text-secondary" />} title="Überfällig">
              {overdue.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </Section>
          )}

          <Section icon={<CalendarClock size={14} />} title="Wichtige Termine" onAll={() => navigate('/schedule')}>
            <div className="divide-y divide-border">
              {upcoming.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate('/schedule')}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-hover"
                >
                  <span className="w-9 text-[12px] font-medium">{b.day}</span>
                  <span className="w-12 text-[12px] tabular-nums text-text-secondary">{b.start}</span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: SCHEDULE_TYPE[b.type] }}
                  />
                  <span className="flex-1 truncate">{b.title}</span>
                  <AvatarStack ids={b.responsiblePersonIds} size={18} />
                </button>
              ))}
            </div>
          </Section>

          <Section icon={<ListTodo size={14} />} title="Alle offenen Aufgaben" onAll={() => navigate('/tasks')}>
            {open.slice(0, 8).map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-3">
      <div className="text-[22px] font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="text-[12px] text-text-secondary">{label}</div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
  onAll,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onAll?: () => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-[13px] font-medium">
        {icon} {title}
        {onAll && (
          <button onClick={onAll} className="ml-auto flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text">
            Alle <ArrowRight size={12} />
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-4 text-[13px] text-text-tertiary">{children}</div>;
}
