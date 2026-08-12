# Info-TV / Lobby Display

Een apart onderdeel in het project: een fullscreen infoscherm voor de TV in de inkomhal, beheerd via templates met slides. Zowel in de Lovable-app als in de PHP/MySQL-versie.

## Wat de TV toont

Een fullscreen kiosk-pagina die automatisch door slides roteert, zonder muis of toetsenbord:

- Achtergrondfoto's met zachte Ken Burns-beweging (langzaam inzoomen/pannen) en crossfade tussen slides
- Vrij aan te passen tekst per slide (titel + ondertitel/bodytekst)
- Klok en datum/dag, altijd in beeld (Nederlands, Brussel-tijd), met keuze positie (hoek) en aan/uit per template
- Optionele slide "Planning vandaag": de activiteiten van vandaag met uur, titel, locatie en medewerker
- Auto-refresh: nieuwe inhoud verschijnt op de TV zonder handmatig herladen

## Beheer (management/admin)

Nieuwe pagina "Infoscherm" met:

- Lijst van displays: naam, geheime code/link, actief template, knop "Open op TV" en "Kopieer link"
- Templates: naam, thema (kleur/overlay-sterkte, tekstgrootte), klok aan/uit + positie, standaard slideduur
- Slides per template, met drag-vrije op/neer-ordening: type (tekst, foto's, planning-vandaag), duur in seconden, titel, tekst, achtergrondafbeelding(en), actief-vlag
- Afbeeldingen uploaden (app: storage bucket `display-media`, publiek leesbaar; PHP: `public/uploads/display/`)
- Preview-knop die het scherm in een venster toont

## Toegang

De TV opent een publieke link met geheime code: `/display/<code>` (app) en `/display/<code>` (PHP). Geen login. De code is lang en willekeurig, en kan per display opnieuw gegenereerd worden. Alleen de slide-inhoud en de activiteiten van vandaag (uur, titel, locatie, voornaam medewerker) worden meegegeven — geen notities, e-mailadressen of andere persoonsdata.

## Technisch

Nieuwe tabellen (Postgres-migratie + zelfde structuur in `php/config/schema.sql`):

- `displays`: id, name, code (unique), template_id, active, timezone, created_at
- `display_templates`: id, name, theme jsonb (kleuren/overlay/tekstgrootte), show_clock, clock_position, default_slide_seconds, created_by
- `display_slides`: id, template_id, kind ('text' | 'photos' | 'planning_today'), position, title, body, media jsonb (lijst van URL's), seconds, active

RLS: management/admin volledig beheer; geen anon-toegang op de tabellen. De publieke display-render gaat via een server function/route die met de secret code de data ophaalt (`code` → template + slides + planning van vandaag), niet via directe client-queries. GRANTs per tabel zoals in de rest van het project.

App-kant:

- `src/lib/display.functions.ts`: `getDisplayByCode` (publiek, code-gevalideerd, alleen veilige velden), plus beheer-functions voor displays/templates/slides
- `src/routes/display.$code.tsx`: publieke fullscreen route buiten `_authenticated`, eigen minimale layout zonder AppShell, polling elke 60 s voor nieuwe inhoud
- `src/components/display/`: `SlideShow`, `PhotoBackdrop` (Ken Burns + crossfade), `ClockOverlay`, `PlanningTodaySlide`
- `src/routes/_authenticated/display.index.tsx` (+ detailpagina voor slides) voor beheer; nav-item "Infoscherm" in `AppShell.tsx`, zichtbaar voor management/admin

PHP-kant:

- `php/src/Controllers/DisplayController.php`: publieke `show($code)` + JSON `data($code)`, en beheeracties voor templates/slides/uploads
- `php/src/Views/display/screen.php` (fullscreen, eigen layout zonder navigatie) en `php/src/Views/display/admin.php`
- `php/public/assets/display.js` + `display.css`: slideshow, crossfade, Ken Burns, klok, polling
- Routes toegevoegd in de router; `php-download/planning-php.zip` opnieuw gegenereerd

## Buiten scope

Geen video-achtergronden, geen weer- of RSS-feeds, geen meerdere schermen tegelijk synchroniseren. Die kunnen later.
