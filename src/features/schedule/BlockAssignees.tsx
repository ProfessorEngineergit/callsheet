import { Check, UserPlus, Lock } from 'lucide-react';
import { Menu, MenuItem } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { useData } from '@/store/data';
import { useAuth } from '@/store/auth';
import { useToast } from '@/store/toast';
import { updateBlock } from '@/lib/db';
import { effectiveAssignees } from '@/lib/schedule';
import { isBahrian } from '@/lib/perms';
import type { ScheduleBlock } from '@/types';

// Inline-Zuteilung: Technik-Team ist überall standardmäßig dabei.
// Entfernen/Deaktivieren von Personen darf vorerst nur Bahrian.
export function BlockAssignees({ block }: { block: ScheduleBlock }) {
  const { people } = useData();
  const { appUser } = useAuth();
  const toast = useToast();
  const canRemove = isBahrian(appUser);

  const effective = effectiveAssignees(block, people);
  const excluded = new Set(block.excludedPersonIds ?? []);
  const responsible = block.responsiblePersonIds ?? [];
  const technik = people.filter((p) => p.group === 'technik');
  const technikIds = new Set(technik.map((p) => p.id));
  const others = people.filter((p) => !technikIds.has(p.id));

  const denyRemove = () => toast.show('Nur Bahrian darf Personen aus einem Punkt entfernen.');

  // Technik-Mitglied an-/abschalten (abschalten = Bahrian-only).
  const toggleTechnik = (id: string) => {
    if (excluded.has(id)) {
      updateBlock(block.id, { excludedPersonIds: [...excluded].filter((x) => x !== id) });
    } else {
      if (!canRemove) return denyRemove();
      updateBlock(block.id, { excludedPersonIds: [...excluded, id] });
    }
  };

  // Zusätzliche Person (Veranstalter) hinzufügen/entfernen (entfernen = Bahrian-only).
  const toggleOther = (id: string) => {
    if (responsible.includes(id)) {
      if (!canRemove) return denyRemove();
      updateBlock(block.id, { responsiblePersonIds: responsible.filter((x) => x !== id) });
    } else {
      updateBlock(block.id, { responsiblePersonIds: [...responsible, id] });
    }
  };

  return (
    <Menu
      align="right"
      trigger={() => (
        <span className="flex items-center gap-1.5 text-text-secondary hover:text-text">
          {effective.length === 0 ? (
            <span className="flex items-center gap-1 text-text-tertiary">
              <UserPlus size={14} /> Zuteilen
            </span>
          ) : (
            <span className="flex -space-x-1.5">
              {effective.slice(0, 6).map((id) => {
                const p = people.find((x) => x.id === id);
                return (
                  <span key={id} className="rounded-full ring-1 ring-panel">
                    <Avatar name={p?.name ?? id} color={p?.color} initials={p?.initials} size={22} />
                  </span>
                );
              })}
              {effective.length > 6 && (
                <span className="ml-1.5 self-center text-[11px] text-text-tertiary">
                  +{effective.length - 6}
                </span>
              )}
            </span>
          )}
        </span>
      )}
    >
      {() => (
        <div className="max-h-80 w-60 overflow-auto">
          <div className="flex items-center justify-between px-3 py-1 text-[10px] uppercase tracking-wide text-text-tertiary">
            <span>Technik-Team</span>
            {!canRemove && (
              <span title="Entfernen nur durch Bahrian">
                <Lock size={10} />
              </span>
            )}
          </div>
          {technik.map((p) => {
            const active = !excluded.has(p.id);
            return (
              <MenuItem key={p.id} active={active} onClick={() => toggleTechnik(p.id)}>
                <Avatar name={p.name} color={p.color} initials={p.initials} size={18} /> {p.name}
                {active && <Check size={13} className="ml-auto text-text" />}
              </MenuItem>
            );
          })}
          <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-text-tertiary">
            Weitere Personen
          </div>
          {others.map((p) => {
            const active = responsible.includes(p.id);
            return (
              <MenuItem key={p.id} active={active} onClick={() => toggleOther(p.id)}>
                <Avatar name={p.name} color={p.color} initials={p.initials} size={18} /> {p.name}
                {active && <Check size={13} className="ml-auto text-text" />}
              </MenuItem>
            );
          })}
        </div>
      )}
    </Menu>
  );
}
