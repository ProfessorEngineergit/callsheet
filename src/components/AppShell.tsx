import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Plus, Search } from 'lucide-react';
import { NAV, MOBILE_NAV } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import { useUI } from '@/store/ui';
import { Avatar } from '@/components/Avatar';
import { CommandPalette } from '@/components/CommandPalette';
import { useShortcuts } from '@/hooks/useShortcuts';
import { NewTaskDialog } from '@/features/tasks/NewTaskDialog';
import { TaskDrawer } from '@/features/tasks/TaskDrawer';

export function AppShell({ children }: { children: ReactNode }) {
  const { appUser, logout } = useAuth();
  const { setPaletteOpen, setNewTaskOpen } = useUI();
  useShortcuts();

  return (
    <div className="flex h-full">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-bg md:flex">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
            <svg width="14" height="14" viewBox="0 0 32 32">
              <path d="M9 10h14M9 16h14M9 22h9" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-[13px] font-semibold">callsheet</div>
        </div>

        <div className="px-3 pb-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex w-full items-center gap-2 rounded-md border border-border bg-panel px-2.5 py-1.5 text-text-tertiary hover:bg-hover"
          >
            <Search size={13} />
            <span className="flex-1 text-left text-[12px]">Suchen…</span>
            <kbd className="rounded border border-border px-1 text-[10px]">⌘K</kbd>
          </button>
        </div>

        <div className="px-3 pb-3">
          <button onClick={() => setNewTaskOpen(true)} className="btn-primary w-full">
            <Plus size={14} /> Neue Aufgabe
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                  isActive
                    ? 'bg-hover text-text'
                    : 'text-text-secondary hover:bg-hover hover:text-text',
                )
              }
            >
              <n.icon size={15} /> {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-2">
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
            <Avatar
              name={appUser?.name ?? 'Du'}
              color={appUser?.color}
              initials={appUser?.initials}
              size={24}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px]">{appUser?.name}</div>
              <div className="truncate text-[11px] text-text-tertiary">
                {appUser?.role === 'admin' ? 'Admin' : 'Mitglied'}
              </div>
            </div>
            <button onClick={logout} title="Abmelden" className="text-text-tertiary hover:text-text">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Hauptbereich */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile-Topbar */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white">
              <svg width="14" height="14" viewBox="0 0 32 32">
                <path d="M9 10h14M9 16h14M9 22h9" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold">callsheet</span>
          </div>
          <button onClick={() => setPaletteOpen(true)} className="btn-ghost px-2">
            <Search size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">{children}</div>
      </main>

      {/* Tab-Bar (Mobile) */}
      <MobileTabBar />
      <MobileNewTaskFab />

      {/* Globale Overlays */}
      <CommandPalette />
      <NewTaskDialog />
      <TaskDrawer />
    </div>
  );
}

function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t border-border bg-bg/95 backdrop-blur md:hidden">
      {MOBILE_NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
              isActive ? 'text-accent' : 'text-text-tertiary',
            )
          }
        >
          <n.icon size={19} />
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

function MobileNewTaskFab() {
  const { setNewTaskOpen } = useUI();
  return (
    <button
      onClick={() => setNewTaskOpen(true)}
      className="fixed bottom-16 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-black/40 md:hidden"
      aria-label="Neue Aufgabe"
    >
      <Plus size={22} />
    </button>
  );
}
