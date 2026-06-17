import { ShieldOff } from 'lucide-react';
import { useAuth } from '@/store/auth';

export function AccessDenied({ email }: { email: string }) {
  const { logout } = useAuth();
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="card max-w-sm p-6 text-center">
        <ShieldOff size={28} className="mx-auto mb-3 text-text-tertiary" />
        <h1 className="mb-1 text-[15px] font-semibold">Kein Zugang</h1>
        <p className="text-text-secondary">
          <span className="font-medium text-text">{email}</span> ist nicht für diese App
          freigeschaltet.
        </p>
        <p className="mt-2 text-[12px] text-text-tertiary">
          Wende dich an Kay Schmid oder Bahrian Novotny.
        </p>
        <button onClick={logout} className="btn-outline mt-5 w-full">
          Abmelden
        </button>
      </div>
    </div>
  );
}
