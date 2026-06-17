import { useEffect } from 'react';
import { Command } from 'cmdk';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { useUI } from '@/store/ui';
import { useData } from '@/store/data';
import { NAV } from '@/lib/nav';
import { StatusIcon } from '@/components/icons';

export function CommandPalette() {
  const navigate = useNavigate();
  const { paletteOpen, setPaletteOpen, setNewTaskOpen, setOpenTaskId } = useUI();
  const { tasks, acts, people } = useData();

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPaletteOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPaletteOpen]);

  if (!paletteOpen) return null;

  const close = () => setPaletteOpen(false);
  const run = (fn: () => void) => {
    fn();
    close();
  };

  return createPortal(
    <div data-cmdk-overlay="" onMouseDown={close} className="flex items-start justify-center pt-[12vh]">
      <div onMouseDown={(e) => e.stopPropagation()}>
        <Command label="Command Palette" loop>
          <Command.Input placeholder="Suchen oder Aktion ausführen…" autoFocus />
          <Command.List>
            <Command.Empty>Keine Treffer.</Command.Empty>

            <Command.Group heading="Aktionen">
              <Command.Item onSelect={() => run(() => setNewTaskOpen(true))}>
                <Plus size={15} /> Neue Aufgabe erstellen
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              {NAV.map((n) => (
                <Command.Item
                  key={n.to}
                  value={`gehe zu ${n.label}`}
                  onSelect={() => run(() => navigate(n.to))}
                >
                  <n.icon size={15} /> {n.label}
                  <ArrowRight size={13} className="ml-auto text-text-tertiary" />
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Aufgaben">
              {tasks.map((t) => (
                <Command.Item
                  key={t.id}
                  value={`aufgabe ${t.title}`}
                  onSelect={() =>
                    run(() => {
                      navigate('/tasks');
                      setOpenTaskId(t.id);
                    })
                  }
                >
                  <StatusIcon status={t.status} /> {t.title}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Programm">
              {acts.map((a) => (
                <Command.Item
                  key={a.id}
                  value={`programm ${a.title} ${a.category}`}
                  onSelect={() => run(() => navigate('/acts'))}
                >
                  {a.rehearsalTime && (
                    <span className="text-text-tertiary tabular-nums">{a.rehearsalTime}</span>
                  )}{' '}
                  {a.title} <span className="text-text-tertiary">· {a.category}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Team">
              {people.map((p) => (
                <Command.Item
                  key={p.id}
                  value={`person ${p.name} ${p.tags.join(' ')}`}
                  onSelect={() => run(() => navigate(`/team/${p.id}`))}
                >
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[8px] text-white"
                    style={{ background: p.color }}
                  >
                    {p.initials}
                  </span>
                  {p.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body,
  );
}
