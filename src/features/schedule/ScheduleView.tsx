import { useState } from 'react';
import { CalendarDays, Plus, StickyNote, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, Spinner } from '@/components/ui';
import { useData } from '@/store/data';
import { DAYS, SCHEDULE_TYPE } from '@/lib/constants';
import { deleteBlock } from '@/lib/db';
import { cn } from '@/lib/utils';
import type { ScheduleBlock, ScheduleDay } from '@/types';
import { EditMeta } from '@/components/EditMeta';
import { BlockFeed } from './BlockFeed';
import { BlockAssignees } from './BlockAssignees';
import { BlockDialog } from './BlockDialog';

// Aktueller Wochentag → Zeitplan-Tag (Mi/Do/Fr/Sa). Außerhalb: Freitag (Show-Tag).
function todayScheduleDay(): ScheduleDay {
  const map: Record<number, ScheduleDay> = { 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa' };
  return map[new Date().getDay()] ?? 'Fr';
}

export function ScheduleView() {
  const { blocks, loading } = useData();
  const [day, setDay] = useState<ScheduleDay>(todayScheduleDay);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBlock, setEditBlock] = useState<ScheduleBlock | undefined>();

  const dayBlocks = blocks
    .filter((b) => b.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));

  const openNew = () => {
    setEditBlock(undefined);
    setDialogOpen(true);
  };
  const openEdit = (b: ScheduleBlock) => {
    setEditBlock(b);
    setDialogOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Zeitplan" icon={<CalendarDays size={16} />}>
        <button onClick={openNew} className="btn-primary">
          <Plus size={14} /> <span className="hidden sm:inline">Eintrag</span>
        </button>
      </PageHeader>

      <div className="flex gap-1 border-b border-border px-3 py-2">
        {DAYS.map((d) => {
          const count = blocks.filter((b) => b.day === d.key).length;
          return (
            <button
              key={d.key}
              onClick={() => setDay(d.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px]',
                day === d.key ? 'bg-hover text-text' : 'text-text-secondary hover:bg-hover',
              )}
            >
              {d.label}
              <span className="text-[11px] text-text-tertiary">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loading ? (
          <Spinner />
        ) : dayBlocks.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={28} />}
            title="Keine Einträge an diesem Tag"
            action={
              <button onClick={openNew} className="btn-primary">
                <Plus size={14} /> Eintrag hinzufügen
              </button>
            }
          />
        ) : (
          <div className="mx-auto max-w-2xl">
            {dayBlocks.map((b) => {
              const color = SCHEDULE_TYPE[b.type];
              const highlight = b.type === 'Show' || b.type === 'Abbau';
              return (
                <div key={b.id} className="flex gap-3">
                  {/* Zeitachse */}
                  <div className="flex w-14 shrink-0 flex-col items-end pt-3 text-[12px] tabular-nums">
                    <span className="font-medium">{b.start}</span>
                    {b.end && <span className="text-text-tertiary">{b.end}</span>}
                  </div>
                  <div className="relative flex flex-col items-center">
                    <span
                      className="mt-3.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  {/* Block */}
                  <div
                    className={cn('card mb-3 flex-1 p-3', highlight && 'ring-1')}
                    style={
                      highlight
                        ? { borderColor: color, boxShadow: `inset 0 0 0 1px ${color}33` }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium">{b.title}</div>
                        <span
                          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: color + '22', color }}
                        >
                          {b.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BlockAssignees blockId={b.id} value={b.responsiblePersonIds} />
                        <button
                          onClick={() => openEdit(b)}
                          className="ml-1 text-text-tertiary hover:text-text"
                          title="Bearbeiten"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`„${b.title}" löschen?`)) deleteBlock(b.id);
                          }}
                          className="text-text-tertiary hover:text-status-blocked"
                          title="Löschen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {b.note && (
                      <div className="mt-2 flex gap-1.5 rounded-md bg-bg p-2 text-[12px] text-text-secondary">
                        <StickyNote size={13} className="mt-0.5 shrink-0 text-text-tertiary" />
                        <span>{b.note}</span>
                      </div>
                    )}

                    {b.updatedByName && (
                      <EditMeta by={b.updatedByName} at={b.updatedAt} className="mt-2" />
                    )}

                    {/* Nachrichten-Feed pro Punkt */}
                    <BlockFeed blockId={b.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BlockDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        day={day}
        edit={editBlock}
      />
    </div>
  );
}
