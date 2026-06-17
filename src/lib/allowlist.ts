import type { User } from 'firebase/auth';

// Namensfragmente der zugelassenen Personen (case-insensitiv, Teilstring-Match).
// Kann später durch exakte E-Mail-Prüfung in Firestore-Rules ersetzt werden.
const ALLOWED_PATTERNS = [
  // Lou Huber
  'lou huber', 'louhuber',
  // Bahrian Novotny
  'bahrian', 'novotny',
  // Simon Bentlage
  'simon', 'bentlage',
  // Lorenzo Bay-Mueller / Müller
  'lorenzo', 'bay-mueller', 'bay-müller', 'bay mueller', 'bay müller',
  // Thorsten (Hochhaus)
  'thorsten',
  // Kay Schmid
  'kay schmid', 'kschmid',
];

export function isAllowedUser(user: User): boolean {
  const haystack = [user.displayName ?? '', user.email ?? '']
    .join(' ')
    .toLowerCase()
    // Umlaute normalisieren: ü→ue für Mueller/Müller-Abgleich
    .replace(/ü/g, 'ü'); // normalisiert schon durch toLowerCase

  return ALLOWED_PATTERNS.some((p) => haystack.includes(p.toLowerCase()));
}
