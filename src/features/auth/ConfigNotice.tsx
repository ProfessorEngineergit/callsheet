import { Settings } from 'lucide-react';

// Wird angezeigt, wenn keine Firebase-Config in .env.local gesetzt ist.
export function ConfigNotice() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="card max-w-md p-6">
        <div className="mb-3 flex items-center gap-2 text-text">
          <Settings size={18} />
          <h1 className="text-[15px] font-semibold text-text">Firebase-Konfiguration fehlt</h1>
        </div>
        <p className="text-text-secondary">
          Lege eine Datei <code className="rounded bg-hover px-1">.env.local</code> im Projekt-Root
          an (Vorlage: <code className="rounded bg-hover px-1">.env.local.example</code>) und trage
          deine Firebase-Werte ein. Eine Schritt-für-Schritt-Anleitung steht in der{' '}
          <code className="rounded bg-hover px-1">README.md</code>.
        </p>
        <p className="mt-3 text-text-tertiary">Danach den Dev-Server neu starten.</p>
      </div>
    </div>
  );
}
