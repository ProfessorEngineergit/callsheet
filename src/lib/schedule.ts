import type { Person, ScheduleBlock } from '@/types';

// Alle Technik-Team-Mitglieder.
export function technikPeople(people: Person[]): Person[] {
  return people.filter((p) => p.group === 'technik');
}

// Effektiv einem Punkt zugeteilte Personen:
//   = ganzes Technik-Team (außer ausdrücklich entfernten) + zusätzlich zugeteilte (Veranstalter).
// Damit ist das Technik-Team standardmäßig überall dabei.
export function effectiveAssignees(block: ScheduleBlock, people: Person[]): string[] {
  const technik = technikPeople(people);
  const technikIds = new Set(technik.map((p) => p.id));
  const excluded = new Set(block.excludedPersonIds ?? []);
  const base = technik.filter((p) => !excluded.has(p.id)).map((p) => p.id);
  const extras = (block.responsiblePersonIds ?? []).filter((id) => !technikIds.has(id));
  return [...base, ...extras];
}
