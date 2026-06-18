import { Link, useNavigate, useParams } from 'react-router-dom';
import { Users, Mail, Phone, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, Pill, Spinner } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { TaskRow } from '@/features/tasks/TaskRow';
import { useData } from '@/store/data';
import type { Person } from '@/types';

export function TeamView() {
  const { people, loading, tasks } = useData();

  const technik = people.filter((p) => p.group === 'technik');
  const veranstalter = people.filter((p) => p.group !== 'technik');

  const openCount = (id: string) =>
    tasks.filter((t) => t.assigneeIds.includes(id) && t.status !== 'done').length;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Team" icon={<Users size={16} />}>
        <span className="text-[12px] text-text-tertiary">{people.length} Beteiligte</span>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <Spinner />
        ) : people.length === 0 ? (
          <EmptyState icon={<Users size={28} />} title="Noch keine Beteiligten" />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <Group title="Technik-Team" hint="Das sind wir" people={technik} openCount={openCount} />
            <Group title="Veranstalter" hint="Schule & Künstler" people={veranstalter} openCount={openCount} />
          </div>
        )}
      </div>
    </div>
  );
}

function Group({
  title,
  hint,
  people,
  openCount,
}: {
  title: string;
  hint: string;
  people: Person[];
  openCount: (id: string) => number;
}) {
  if (people.length === 0) return null;
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        <span className="text-[12px] text-text-tertiary">{hint}</span>
        <span className="ml-auto text-[12px] text-text-tertiary">{people.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => {
          const open = openCount(p.id);
          return (
            <Link
              key={p.id}
              to={`/team/${p.id}`}
              className="card flex items-center gap-3 p-3 hover:border-[#444]"
            >
              <Avatar name={p.name} color={p.color} initials={p.initials} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{p.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.tags.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
              </div>
              {open > 0 && (
                <span className="rounded-full bg-hover px-2 py-0.5 text-[11px] text-text-secondary">
                  {open}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PersonDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { personById, tasks } = useData();
  const person = id ? personById(id) : undefined;

  if (!person)
    return (
      <div className="p-4">
        <button onClick={() => navigate('/team')} className="btn-ghost mb-4">
          <ArrowLeft size={15} /> Team
        </button>
        <EmptyState icon={<Users size={28} />} title="Person nicht gefunden" />
      </div>
    );

  const assigned = tasks.filter((t) => t.assigneeIds.includes(person.id));

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={person.name} icon={<Users size={16} />} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-border p-4">
          <button onClick={() => navigate('/team')} className="btn-ghost mb-3 -ml-2">
            <ArrowLeft size={15} /> Alle Beteiligten
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={person.name} color={person.color} initials={person.initials} size={52} />
            <div>
              <div className="text-[17px] font-semibold">{person.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <Pill>{person.group === 'technik' ? 'Technik-Team' : 'Veranstalter'}</Pill>
                {person.tags.map((t) => (
                  <Pill key={t}>{t}</Pill>
                ))}
              </div>
            </div>
          </div>
          {/* Kontakt als tap-to-call / mailto (wichtig für Mobile) */}
          <div className="mt-3 flex flex-col gap-1.5">
            {person.email && (
              <a href={`mailto:${person.email}`} className="flex items-center gap-2 text-text hover:underline">
                <Mail size={14} /> {person.email}
              </a>
            )}
            {person.phone && (
              <a href={`tel:${person.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-text hover:underline">
                <Phone size={14} /> {person.phone}
              </a>
            )}
            {!person.email && !person.phone && (
              <span className="text-[12px] text-text-tertiary">Kein Kontakt hinterlegt.</span>
            )}
          </div>
          {person.note && <p className="mt-3 text-text-secondary">{person.note}</p>}
        </div>

        <div className="px-4 py-2 text-[12px] text-text-secondary">
          Zugewiesene Aufgaben <span className="text-text-tertiary">{assigned.length}</span>
        </div>
        {assigned.length === 0 ? (
          <div className="px-4 py-6 text-[13px] text-text-tertiary">Keine Aufgaben zugewiesen.</div>
        ) : (
          assigned.map((t) => <TaskRow key={t.id} task={t} />)
        )}
      </div>
    </div>
  );
}
