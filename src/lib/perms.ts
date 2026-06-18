import type { AppUser } from '@/types';

// Wer darf Personen aus einem Zeitplan-Punkt entfernen/deaktivieren?
// Vorerst nur Bahrian Novotny.
export function isBahrian(u: AppUser | null): boolean {
  if (!u) return false;
  const name = (u.name || '').toLowerCase();
  const email = (u.email || '').toLowerCase();
  return name.includes('bahrian') || name.includes('novotny') || email.startsWith('bahriannovotny');
}
