import { Navigate, Route, Routes } from 'react-router-dom';
import { isFirebaseConfigured } from '@/lib/firebase';
import { AuthProvider, useAuth } from '@/store/auth';
import { DataProvider } from '@/store/data';
import { Login } from '@/features/auth/Login';
import { AccessDenied } from '@/features/auth/AccessDenied';
import { AppShell } from '@/components/AppShell';
import { InboxView } from '@/features/inbox/InboxView';
import { TasksView } from '@/features/tasks/TasksView';
import { ScheduleView } from '@/features/schedule/ScheduleView';
import { TeamView, PersonDetailView } from '@/features/team/TeamView';
import { Spinner } from '@/components/ui';
import { ConfigNotice } from '@/features/auth/ConfigNotice';

function Gate() {
  const { user, loading, allowed } = useAuth();
  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner label="Lädt…" />
      </div>
    );
  if (!user) return <Login />;
  if (!allowed) return <AccessDenied email={user.email ?? user.displayName ?? ''} />;
  return (
    <DataProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<InboxView />} />
          <Route path="/schedule" element={<ScheduleView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/team" element={<TeamView />} />
          <Route path="/team/:id" element={<PersonDetailView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </DataProvider>
  );
}

export default function App() {
  if (!isFirebaseConfigured) return <ConfigNotice />;
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
