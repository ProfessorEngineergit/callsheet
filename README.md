# callsheet

Mobil-first Projektmanagement-Tool für die **Abendshow zur 75-Jahr-Feier der Waldorfschule
Frankfurt**. Mehrere Beteiligte (Schule, Technik, Artistik, Musik, Orga) koordinieren sich in
Echtzeit: Programmpunkte, Zeitplan, Aufgaben/Zuteilungen, Notizen, Kontakte, offene Punkte.

Das UI ist an **Linear** angelehnt: dunkel, ruhig, dicht, tastatur-getrieben, schnell – und auf
Mobile wie Desktop gleichermaßen bedienbar.

## Tech-Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** mit eigenen Design-Tokens (Linear-Dark-Mode)
- **Firebase**: Authentication (E-Mail/Passwort **und** Google) + **Cloud Firestore**
  (Echtzeit-Sync via `onSnapshot`, Offline-Persistence aktiviert)
- **React Router** v6 · **Zustand** (UI-State) · **lucide-react** · **date-fns** (Locale `de`) ·
  **cmdk** (Command-Palette)

Kein eigener Backend-Server – Firestore ist die Datenbank.

---

## Schnellstart

```bash
npm install
cp .env.local.example .env.local   # Werte eintragen (siehe unten)
npm run dev                          # http://localhost:5173
```

Ohne ausgefüllte `.env.local` zeigt die App einen Konfigurations-Hinweis statt des Logins.

---

## 1) Firebase-Projekt einrichten

1. **Projekt anlegen:** [console.firebase.google.com](https://console.firebase.google.com) →
   *Projekt hinzufügen*.
2. **Web-App registrieren:** Projektübersicht → Symbol `</>` → App-Namen vergeben → registrieren.
   Firebase zeigt das `firebaseConfig`-Objekt – diese Werte brauchst du gleich.
3. **Authentication aktivieren:** Linke Navigation → *Authentication* → *Sign-in method* →
   - **E-Mail/Passwort** aktivieren
   - **Google** aktivieren (Support-E-Mail wählen)
   - Unter *Settings → Authorized domains* ist `localhost` bereits erlaubt.
4. **Firestore anlegen:** *Firestore Database* → *Datenbank erstellen* → **Produktionsmodus** →
   Region wählen (z. B. `eur3`).

## 2) `.env.local` ausfüllen

Trage die Werte aus dem `firebaseConfig`-Objekt ein:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dein-projekt
VITE_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

> **Wichtig:** `.env.local` ist in `.gitignore` – niemals echte Keys committen.
> (Firebase-Web-API-Keys sind zwar nicht geheim, aber wir halten die Konfiguration trotzdem
> projektlokal.)

## 3) Security-Rules deployen

Die Regeln (`firestore.rules`) erlauben Lesen/Schreiben nur eingeloggten Nutzern; **Löschen** nur
Admins (`role: 'admin'` im User-Dokument).

```bash
npm i -g firebase-tools
firebase login
firebase use --add        # dein Projekt auswählen
firebase deploy --only firestore:rules
```

Alternativ: Regelinhalt in der Firebase-Console unter *Firestore → Regeln* einfügen und
veröffentlichen.

## 4) Seed-Daten einspielen

Befüllt Firestore mit allen Beteiligten, Programmpunkten, Zeitblöcken, Aufgaben und einer Notiz aus
dem realen E-Mail-Verlauf. **Idempotent** – eine Sammlung wird nur befüllt, wenn sie leer ist.

1. **Service-Account-Schlüssel laden:** Firebase-Console → *Projekteinstellungen* (Zahnrad) →
   *Dienstkonten* → **Neuen privaten Schlüssel generieren** → die JSON-Datei als
   `serviceAccount.json` ins Projekt-Root legen (ist in `.gitignore`).
2. Skript ausführen:
   ```bash
   npm run seed
   ```

## 5) Dich selbst als Admin freischalten (optional)

Beim ersten Login wird automatisch ein User-Dokument mit `role: 'member'` angelegt. Um löschen zu
dürfen: in der Firebase-Console unter *Firestore → users → <deine uid>* das Feld `role` auf `admin`
setzen.

> Damit „Mir zugewiesen" in der Inbox greift, sollte deine Login-**E-Mail** mit der E-Mail einer
> Person im Team übereinstimmen (Abgleich erfolgt über die E-Mail-Adresse).

---

## Datenmodell (Firestore)

Top-Level-Sammlungen für eine einzelne Projekt-Instanz:

| Sammlung         | Inhalt                                                        |
| ---------------- | ------------------------------------------------------------- |
| `users`          | App-Nutzer (Auth) inkl. `role` (`admin`/`member`)             |
| `people`         | Beteiligte / Mitarbeiter (mit Tags, Kontakt, Avatar-Farbe)    |
| `acts`           | Programmpunkte / Auftritte (Reihenfolge, Probenzeit, Status)  |
| `scheduleBlocks` | Ablauf-/Aufbauplan über mehrere Tage (Mi–Sa)                  |
| `tasks`          | Aufgaben / Zuteilungen (das „Issue"-Äquivalent)               |
| `notes`          | Freie Notizen (Markdown), an Act/Task/Person koppelbar        |
| `comments`       | Kommentare/Aktivität an einer Aufgabe                         |

Alle Typen sind zentral in [`src/types.ts`](src/types.ts) definiert.

---

## Ansichten & Features

- **Inbox/Dashboard** – „Mir zugewiesen", überfällige/offene Aufgaben, wichtige Termine.
- **Aufgaben** – Listen- **und** Board-Ansicht (Kanban mit Drag-and-Drop), Filter nach Assignee,
  Tag, Status, Priorität, Programmpunkt. Detail-Drawer (Desktop) / Vollbild-Sheet (Mobile) mit
  Markdown-Beschreibung, Multi-Assignees, Tags, Priorität, Fälligkeit, Verknüpfungen, Kommentaren.
- **Zeitplan** – Tages-Tabs (Mi/Do/Fr/Sa), Timeline, farbcodiert nach Typ; unsichere Blöcke und
  Show/Abbau hervorgehoben.
- **Programm** – Auftritte in Reihenfolge mit Probenzeit, Mitwirkenden, Anforderungen, Status.
- **Team** – Beteiligte mit farbigem Avatar, Tags, `tel:`/`mailto:`-Kontakt; Klick → zugewiesene
  Aufgaben.
- **Notizen** – chronologischer Markdown-Feed, filterbar.
- **Command-Palette** (⌘/Ctrl + K) + globale Suche über Aufgaben, Programm, Team, Navigation.

### Tastatur-Shortcuts

| Taste            | Aktion                                  |
| ---------------- | --------------------------------------- |
| `⌘/Ctrl + K`     | Command-Palette                         |
| `/`              | Suche (öffnet Palette)                  |
| `C`              | Neue Aufgabe                            |
| `G` dann `I/T/Z/P/E/N` | Gehe zu Inbox/Aufgaben/Zeitplan/Programm/Team/Notizen |

---

## Daten anpassen

Personen, Programmpunkte, Zeitblöcke und Aufgaben für das Seeding stehen kommentiert in
[`scripts/seedData.ts`](scripts/seedData.ts) – dort ändern und erneut `npm run seed` in einer leeren
Sammlung ausführen (oder Einträge direkt in der App bearbeiten, da alles live in Firestore landet).

## Skripte

| Befehl            | Zweck                              |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Dev-Server                         |
| `npm run build`   | Typecheck + Production-Build       |
| `npm run preview` | Production-Build lokal ansehen     |
| `npm run lint`    | ESLint                             |
| `npm run seed`    | Firestore mit Seed-Daten befüllen  |

---

## So startest du (Kurzfassung)

```bash
npm install
cp .env.local.example .env.local        # Firebase-Werte eintragen
firebase deploy --only firestore:rules  # Security-Rules
npm run seed                             # serviceAccount.json nötig
npm run dev
```

Login per E-Mail oder Google → alle Seed-Daten erscheinen, Änderungen syncen in Echtzeit auf alle
Geräte.
