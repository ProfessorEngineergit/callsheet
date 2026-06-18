/**
 * Seed-Skript: befüllt Firestore mit den Daten aus dem E-Mail-Verlauf.
 * Idempotent – legt eine Sammlung nur an, wenn sie leer ist.
 *
 * Voraussetzung: Service-Account-Schlüssel als serviceAccount.json im
 * Projekt-Root (siehe README.md, „Seed-Daten einspielen").
 *
 * Ausführen:  npm run seed
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { people, blocks } from './seedData';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, '..', 'serviceAccount.json');

let serviceAccount: Record<string, unknown>;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
} catch {
  console.error(
    '\n❌  serviceAccount.json nicht gefunden im Projekt-Root.\n' +
      '    Firebase Console → Projekteinstellungen → Dienstkonten →\n' +
      '    „Neuen privaten Schlüssel generieren" → als serviceAccount.json speichern.\n',
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount as never) });
const db = getFirestore();

async function seedCollection<T extends { id: string }>(name: string, docs: T[]) {
  const snap = await db.collection(name).limit(1).get();
  if (!snap.empty) {
    console.log(`↷  ${name}: bereits befüllt – übersprungen.`);
    return;
  }
  const batch = db.batch();
  for (const { id, ...rest } of docs) {
    batch.set(db.collection(name).doc(id), rest);
  }
  await batch.commit();
  console.log(`✓  ${name}: ${docs.length} Dokumente angelegt.`);
}

async function main() {
  await seedCollection('people', people);
  await seedCollection('scheduleBlocks', blocks);
  console.log('\n✅  Seed abgeschlossen.\n');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
