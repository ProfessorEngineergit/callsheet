import { useState } from 'react';
import { CalendarDays, AlertTriangle, StickyNote } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, Spinner } from '@/components/ui';
import { AvatarStack } from '@/components/Avatar';
import { useData } from '@/store/data';
import { DAYS, SCHEDULE_TYPE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ScheduleDay } from '@/types';

export function ScheduleView() {
  const { blocks, loading } = useData();
  const [day, setDay] = useState<ScheduleDay>('Fr');

  const dayBlocks = blocks
    .filter((b) => b.day === day)
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Zeitplan" icon={<CalendarDays size={16} />} />

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
          <EmptyState icon={<CalendarDays size={28} />} title="Keine Einträge an diesem Tag" />
        ) : (
          <div className="mx-auto max-w-2xl">
            {dayBlocks.map((b) => {
              const color = SCHEDULE_TYPE[b.type];
              const highlight = b.type === 'Show' || b.type === 'Abbau';
              return (
                <div key={b.id} className="flex gap-3">
                  {/* Zeitachse */}
                  <div className="flex w-16 shrink-0 flex-col items-end pt-3 text-[12px] tabular-nums">
                    <span className="font-medium">{b.start}</span>
                    {b.end && <span className="text-text-tertiary">{b.end}</span>}
                  </div>
                  {/* Linie */}
                  <div className="relative flex flex-col items-center">
                    <span
                      className="mt-3.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  {/* Block */}
                  <div
                    className={cn(
                      'card mb-3 flex-1 p-3',
                      highlight && 'ring-1',
                    )}
                    style={highlight ? { borderColor: color, boxShadow: `inset 0 0 0 1px ${color}33` } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {b.title}
                          {b.uncertain && (
                            <span
                              title="Unbestätigt"
                              className="inline-flex items-center gap-1 rounded-full bg-status-progress/15 px-1.5 py-0.5 text-[10px] text-status-progress"
                            >
                              <AlertTriangle size={10} /> unsicher
                            </span>
                          )}
                        </div>
                        <span
                          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: color + '22', color }}
                        >
                          {b.type}
                        </span>
                      </div>
                      <AvatarStack ids={b.responsiblePersonIds} size={20} />
                    </div>
                    {b.note && (
                      <div className="mt-2 flex gap-1.5 rounded-md bg-bg p-2 text-[12px] text-text-secondary">
                        <StickyNote size={13} className="mt-0.5 shrink-0 text-text-tertiary" />
                        <span>{b.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
