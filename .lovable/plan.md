# Live takenlijst (checklists)

Mobiel-eerst takenlijst die live meeloopt: per activiteit én een eigen persoonlijke lijst. Taken zijn opnieuw te gebruiken via checklist-sjablonen én door de lijst van een eerdere activiteit te kopiëren.

## Wat de gebruiker krijgt

**Op een activiteit (`/planning/:id`)**
- Blok "Taken" met voortgang (bv. "3/7 afgerond") en een voortgangsbalk.
- Grote tikvriendelijke rijen: tik op de rij = afvinken/afvinken ongedaan maken.
- Snel toevoegen: één invoerveld bovenaan, Enter voegt toe en houdt focus (snel meerdere taken intikken).
- Per taak: hernoemen en verwijderen via een klein menu; slepen niet nodig — nieuwe taken komen onderaan.
- Toegewezen medewerker én management/admin mogen toevoegen, afvinken en verwijderen.
- Knoppen: "Sjabloon toepassen" (kies checklist-sjabloon), "Kopieer van eerdere activiteit" (kies uit recente activiteiten), "Bewaar als sjabloon".
- Live: afvinken door de medewerker verschijnt binnen een seconde bij management op een ander toestel, en omgekeerd.

**Persoonlijke lijst (`/taken`)**
- Eigen losse takenlijst per gebruiker, zelfde snelle invoer en afvinken.
- Afgeronde taken schuiven naar een inklapbaar "Afgerond"-blok.
- Zelfde sjabloon-knoppen, zodat een vaste dagroutine in één tik staat.
- Nieuw navigatie-item "Taken" in de app-navigatie.

**Sjablonen**
- Beheerpagina-uitbreiding: checklist-sjablonen aanmaken/bewerken/verwijderen (naam + lijst met taken).
- Medewerkers kunnen bestaande sjablonen toepassen; management/admin beheert ze.

## Mobiel gedrag

- Rijen minimaal 44px hoog, grote checkbox-hitzone, geen hover-afhankelijke acties.
- Invoerveld blijft bereikbaar boven het toetsenbord; sticky invoer onderaan de lijst op smalle schermen.
- Afvinken is optimistisch: de UI reageert direct, ook bij trage verbinding, en rolt terug bij een fout.

## Technische aanpak

Database (migratie, inclusief GRANTs + RLS):
- `checklist_items`: `activity_id` (nullable), `owner_id` (nullable, voor persoonlijke lijst), `title`, `done`, `done_at`, `done_by`, `position`, timestamps + `set_updated_at` trigger.
- `checklist_templates` + `checklist_template_items`: naam, titel, positie.
- RLS: item van een activiteit is leesbaar/wijzigbaar door de assignee, de creator en admin/management (via `has_role`); persoonlijk item alleen door `owner_id = auth.uid()`. Sjablonen leesbaar voor authenticated, beheer door admin/management.
- Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items`.

App:
- Nieuw `src/lib/checklist.functions.ts` (server fns met `requireSupabaseAuth`): toevoegen, hernoemen, togglen, verwijderen, sjabloon toepassen, kopiëren van activiteit, bewaren als sjabloon.
- Nieuwe component `src/components/ChecklistPanel.tsx` (herbruikbaar voor activiteit en persoonlijke lijst) met TanStack Query + optimistische mutaties.
- Realtime-subscriptie in één `useEffect` met opruimen bij unmount; invalidatie van de betreffende query-key.
- Nieuwe route `src/routes/_authenticated/taken.index.tsx` met eigen `head()` metadata; navigatie-item in `AppShell`.

PHP-versie (`php/`), zelfde functionaliteit:
- Schema-uitbreiding in `php/config/schema.sql` voor dezelfde drie tabellen.
- Nieuwe `ChecklistController` met endpoints voor toevoegen/togglen/verwijderen/sjabloon toepassen, plus JSON-endpoints voor de mobiele UI.
- Taken-blok in `php/src/Views/planning/show.php` en een nieuwe persoonlijke takenpagina; "live" via korte polling (elke ~5s) in `php/public/assets/app.js`, want cPanel heeft geen websockets.
- ZIP-download in `php-download/planning-php.zip` verversen.
