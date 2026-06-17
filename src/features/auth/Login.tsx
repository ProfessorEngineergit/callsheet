import { useState } from 'react';
import { useAuth } from '@/store/auth';

export function Login() {
  const { loginEmail, registerEmail, loginGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') await loginEmail(email, pw);
      else await registerEmail(email, pw, name || email.split('@')[0]);
    } catch (err) {
      setError(err instanceof Error ? mapError(err.message) : 'Anmeldung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    try {
      await loginGoogle();
    } catch (err) {
      setError(err instanceof Error ? mapError(err.message) : 'Google-Login fehlgeschlagen.');
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-5">
      <div className="w-full max-w-[360px]">
        <div className="mb-7 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-panel">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M9 10h14M9 16h14M9 22h9" stroke="#E5484D" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-semibold">callsheet</div>
            <div className="text-[11px] text-text-tertiary">75-Jahr-Feier · Waldorfschule Frankfurt</div>
          </div>
        </div>

        <h1 className="mb-1 text-[17px] font-semibold">
          {mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
        </h1>
        <p className="mb-5 text-text-secondary">
          {mode === 'login' ? 'Willkommen zurück.' : 'Leg ein Konto an, um loszulegen.'}
        </p>

        <button onClick={google} className="btn-outline mb-3 w-full">
          <GoogleIcon /> Mit Google anmelden
        </button>

        <div className="my-3 flex items-center gap-3 text-text-tertiary">
          <div className="h-px flex-1 bg-border" /> oder <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-2.5">
          {mode === 'register' && (
            <input
              className="input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Passwort"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          {error && <div className="text-[12px] text-status-blocked">{error}</div>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? '…' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === 'login' ? 'register' : 'login'));
            setError(null);
          }}
          className="mt-4 w-full text-center text-[12px] text-text-secondary hover:text-text"
        >
          {mode === 'login' ? 'Noch kein Konto? Registrieren' : 'Schon registriert? Anmelden'}
        </button>
      </div>
    </div>
  );
}

function mapError(msg: string): string {
  if (msg.includes('invalid-credential') || msg.includes('wrong-password'))
    return 'E-Mail oder Passwort falsch.';
  if (msg.includes('email-already-in-use')) return 'Diese E-Mail ist bereits registriert.';
  if (msg.includes('weak-password')) return 'Passwort zu schwach (min. 6 Zeichen).';
  if (msg.includes('invalid-email')) return 'Ungültige E-Mail-Adresse.';
  return 'Etwas ist schiefgelaufen. Bitte erneut versuchen.';
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 110-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1024 44c11 0 20-8.9 20-20 0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0124 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 006.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C39.9 36 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
