// Aktueller „Akteur" (eingeloggter Nutzer) für Änderungs-Signaturen.
// Wird von der Auth-Schicht gesetzt und von den db-Schreibfunktionen gelesen,
// damit jede Änderung automatisch „von wem / wann" festhält.
let actor: { uid: string; name: string } = { uid: 'unknown', name: 'Jemand' };

export function setActor(a: { uid: string; name: string }): void {
  actor = a;
}

export function getActor(): { uid: string; name: string } {
  return actor;
}

// Standard-Stempel für Schreiboperationen.
export function stamp() {
  return {
    updatedAt: Date.now(),
    updatedBy: actor.uid,
    updatedByName: actor.name,
  };
}
