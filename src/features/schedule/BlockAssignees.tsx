import { Check, UserPlus } from 'lucide-react';
import { Menu, MenuItem } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { useData } from '@/store/data';
import { updateBlock } from '@/lib/db';

// Inline-Zuteilung von Personen zu einem Zeitplan-Punkt.
export function BlockAssignees({
  blockId,
  value,
}: {
  blockId: string;
  value: string[];
}) {
  const { people } = useData();
  const toggle = (id: string) => {
    const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
    updateBlock(blockId, { responsiblePersonIds: next });
  };

  return (
    <Menu
      align="right"
      trigger={() => (
        <span className="flex items-center gap-1.5 text-text-secondary hover:text-text">
          {value.length === 0 ? (
            <span className="flex items-center gap-1 text-text-tertiary">
              <UserPlus size={14} /> Zuteilen
            </span>
          ) : (
            <span className="flex -space-x-1.5">
              {value.slice(0, 5).map((id) => {
                const p = people.find((x) => x.id === id);
                return (
                  <span key={id} className="rounded-full ring-1 ring-panel">
                    <Avatar name={p?.name ?? id} color={p?.color} initials={p?.initials} size={22} />
                  </span>
                );
              })}
            </span>
          )}
        </span>
      )}
    >
      {() => (
        <div className="max-h-72 w-56 overflow-auto">
          <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-text-tertiary">
            Technik-Team
          </div>
          {people
            .filter((p) => p.group === 'technik')
            .map((p) => (
              <MenuItem key={p.id} active={value.includes(p.id)} onClick={() => toggle(p.id)}>
                <Avatar name={p.name} color={p.color} initials={p.initials} size={18} /> {p.name}
                {value.includes(p.id) && <Check size={13} className="ml-auto text-text" />}
              </MenuItem>
            ))}
          <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-text-tertiary">
            Veranstalter
          </div>
          {people
            .filter((p) => p.group !== 'technik')
            .map((p) => (
              <MenuItem key={p.id} active={value.includes(p.id)} onClick={() => toggle(p.id)}>
                <Avatar name={p.name} color={p.color} initials={p.initials} size={18} /> {p.name}
                {value.includes(p.id) && <Check size={13} className="ml-auto text-text" />}
              </MenuItem>
            ))}
        </div>
      )}
    </Menu>
  );
}
