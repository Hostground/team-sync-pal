# Foto's en kaart bij een activiteit

Doel: bij elke activiteit kun je foto's toevoegen (met optioneel de plek waar de foto genomen is) en de locatie duidelijk op een kaart zien, met een pin die je zelf op de kaart kunt zetten.

## Wat de gebruiker krijgt

### Kaart bij de activiteit
- Bij het aanmaken en bewerken van een activiteit staat onder het locatieveld een kaart (OpenStreetMap), standaard gecentreerd op de vaste werkplek in Riemst (50.78570, 5.02330), zoom 16.
- Eén tik/klik op de kaart zet de pin. De pin kan versleept worden. Coördinaten worden mee opgeslagen.
- Knop "Mijn huidige locatie" zet de pin op je gps-positie (handig op mobiel).
- Adresveld blijft vrij invulbaar tekstveld; als er geen pin gezet is, blijft de kaart op de standaardplek staan.
- Op de activiteitendetailpagina staat een duidelijke kaart met de pin, plus knoppen "Route" (opent Google Maps/OSM-navigatie) en "Coördinaten kopiëren".

### Foto's bij de activiteit
- Op de detailpagina een fotosectie: uploaden vanuit galerij of direct met de camera (mobiel), meerdere foto's tegelijk, met voortgang.
- Optionele schakelaar "Locatie meesturen": bij het uploaden wordt de gps-positie van dat moment bewaard bij de foto.
- Foto's tonen als raster met miniaturen; tikken opent ze groot. Foto's met locatie krijgen een kaartspeldje en zijn ook zichtbaar als extra pin op de activiteitskaart.
- Uploaden en verwijderen mag door de toegewezen medewerker en door management/admin. Eigen foto's mogen door de uploader verwijderd worden; management/admin mag alles verwijderen.
- Alles werkt vlot op telefoon (grote raakvlakken, één kolom).

Dit komt in beide versies: de app en de PHP/cPanel-versie.

## Technische uitvoering

### Database (app)
Migratie:
- `activities`: kolommen `lat double precision`, `lng double precision` (nullable).
- Nieuwe tabel `activity_photos`: `id`, `activity_id` (FK → activities, on delete cascade), `storage_path text`, `caption text`, `lat`, `lng`, `taken_at timestamptz`, `uploaded_by uuid`, `created_at`.
- GRANTs (`authenticated`: select/insert/update/delete; `service_role`: all), RLS aan, policies via bestaande `public.can_access_activity(activity_id)` voor select/insert, delete voor `uploaded_by = auth.uid()` of admin/management via `has_role`.
- Private storage bucket `activity-photos` (via storage-tool), met `storage.objects`-policies: pad-prefix = `activity_id`, lezen/schrijven toegestaan als `can_access_activity` waar is.

### App-code
- `src/components/LocationPicker.tsx`: Leaflet-kaart in edit-modus (pin zetten/verslepen + gps-knop). Leaflet wordt via `react-leaflet` toegevoegd en client-only geladen (`React.lazy` achter `<ClientOnly>`), zodat SSR niet breekt.
- `src/components/ActivityMap.tsx`: read-only kaart met activiteitspin + fotopins, route- en kopieerknop.
- `src/components/ActivityPhotos.tsx`: upload (input met `capture`), raster, lightbox, verwijderen, signed URLs via server functions.
- `src/lib/photos.functions.ts`: server functions `listActivityPhotos`, `createPhotoUploadUrl` (signed upload url), `registerActivityPhoto`, `deleteActivityPhoto` — alle met `requireSupabaseAuth` en toegangscontrole op de activiteit.
- `planning.new.tsx` en `planning.$id.tsx`: locatiepicker toevoegen, `lat`/`lng` meesturen; `planning.functions.ts` schema uitbreiden met `lat`/`lng`.

### PHP-versie
- `php/config/schema.sql`: `ALTER TABLE activities ADD lat DOUBLE NULL, ADD lng DOUBLE NULL;` en tabel `activity_photos` (zelfde velden).
- `php/src/Controllers/PhotoController.php`: upload naar `public/uploads/activities/<activity_id>/`, alleen afbeeldingen, max grootte, rechtencontrole (assignee of staff), verwijderen, JSON-endpoints.
- `php/public/assets/map.js` + Leaflet via CDN: pin zetten in het activiteitenformulier en read-only kaart met fotopins op de detailpagina; `app.css` uitbreiden.
- `php/src/Views/planning/new.php` en `show.php`: kaartblok en fotosectie; `PlanningController` slaat `lat`/`lng` op.
- Routes in `php/public/index.php`, nieuwe uploadmap met `.gitkeep`, en `php-download/planning-php.zip` opnieuw genereren.

Kaartlaag: OpenStreetMap-tiles via Leaflet, geen extra koppeling of sleutel nodig.
