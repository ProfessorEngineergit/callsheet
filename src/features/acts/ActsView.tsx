import { Music, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState, Menu, MenuItem, Pill, Spinner } from '@/components/ui';
import { Avatar } from '@/components/Avatar';
import { useData } from '@/store/data';
import { ACT_CATEGORY, ACT_STATUS } from '@/lib/constants';
import { updateAct } from '@/lib/db';
import type { Act, ActStatus } from '@/types';

const STATUSES: ActStatus[] = ['geplant', 'probt', 'fertig'];

export function ActsView() {
  const { acts, loading, personById } = useData();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Programm" icon={<Music size={16} />}>
        <span className="text-[12px] text-text-tertiary">{acts.length} Programmpunkte</span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <Spinner />
        ) : acts.length === 0 ? (
          <EmptyState icon={<Music size={28} />} title="Noch kein Programm" />
        ) : (
          <div className="mx-auto max-w-3xl p-4">
            {acts.map((act) => (
              <ActCard key={act.id} act={act} renderPerformer={(p) => personById(p)?.name ?? p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActCard({
  act,
  renderPerformer,
}: {
  act: Act;
  renderPerformer: (p: string) => string;
}) {
  const cat = ACT_CATEGORY[act.category];
  return (
    <div className="card mb-2 flex items-center gap-3 p-3">
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span className="text-[11px] text-text-tertiary">#{act.order}</span>
        {act.rehearsalTime && (
          <span className="text-[13px] font-medium tabular-nums">{act.rehearsalTime}</span>
        )}
      </div>
      <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: cat }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{act.title}</span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: cat + '22', color: cat }}
          >
            {act.category}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-text-secondary">
          <div className="flex items-center gap-1.5">
            {act.performers.map((p) => (
              <span key={p} className="flex items-center gap-1">
                <Avatar name={renderPerformer(p)} size={16} /> {renderPerformer(p)}
              </span>
            ))}
          </div>
        </div>
        {act.requirements.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {act.requirements.map((r) => (
              <Pill key={r}>{r}</Pill>
            ))}
          </div>
        )}
        {act.note && <div className="mt-1 text-[12px] text-text-tertiary">{act.note}</div>}
      </div>
      <Menu
        align="right"
        trigger={() => (
          <span
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[12px]"
            style={{ color: ACT_STATUS[act.status].color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: ACT_STATUS[act.status].color }}
            />
            {ACT_STATUS[act.status].label}
          </span>
        )}
      >
        {(close) => (
          <>
            {STATUSES.map((s) => (
              <MenuItem
                key={s}
                active={s === act.status}
                onClick={() => {
                  updateAct(act.id, { status: s });
                  close();
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: ACT_STATUS[s].color }}
                />
                {ACT_STATUS[s].label}
                {s === act.status && <Check size={13} className="ml-auto text-accent" />}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </div>
  );
}
