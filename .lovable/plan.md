# Kalenderweergave op de Overzicht-pagina

Een agenda-weergave (zoals Google Agenda) bovenaan de Overzicht-pagina, met schakelaar tussen **Dag**, **Week**, **Maand** en **Jaar**. De bestaande lijst blijft beschikbaar via een tab "Lijst".

## Wat je krijgt

**Kopbalk**
- Vandaag-knop, vorige/volgende navigatie, en de huidige periode als titel (bv. "augustus 2026", "wk 33 · 10–16 aug", "di 11 aug 2026").
- Weergaveschakelaar: Dag / Week / Maand / Jaar.
- De bestaande filters (status, medewerker, type, alleen ongelezen) werken door op de kalender. De datumvelden Van/Tot worden in kalendermodus automatisch door de zichtbare periode bepaald.

**Dagweergave**
- Verticale tijdlijn (00:00–23:00, standaard gescrold naar 07:00) met activiteitenblokken op hun juiste tijdslot, hoogte volgens duur. Overlappende activiteiten staan naast elkaar.
- Blok toont titel, tijd, medewerker en een kleurbalk van het activiteitstype, plus statusrand (in afwachting / bevestigd / geweigerd).

**Weekweergave**
- 7 kolommen met dezelfde tijdlijn. Op mobiel horizontaal scrollbaar (kolommen compact), vandaag gemarkeerd.

**Maandweergave**
- Klassiek 6x7 raster. Per dag maximaal 3 compacte items met tijd + titel en typekleur; daarboven "+N meer". Dagnummer met vandaag-markering; dagen buiten de maand gedimd.
- Tik op een dag → schakelt naar Dagweergave voor die dag.

**Jaarweergave**
- 12 minimaanden. Elke dag krijgt een intensiteitsindicatie (heatmap-puntjes/tint) op basis van het aantal activiteiten, met het aantal in de tooltip.
- Tik op een maand → Maandweergave; tik op een dag → Dagweergave.

**Detail-info**
- Tik op een activiteitsblok → compacte sheet (mobiel) / popover (desktop) met titel, status, tijd, medewerker, type, locatie en klant, plus knop "Open activiteit" naar de detailpagina.

**Mobiel-eerst**
- Standaard opent op mobiel de Dagweergave, op desktop de Weekweergave. Grote tikzones, swipe links/rechts wisselt periode.

## Technisch

- Geen nieuwe libraries: opbouw met `date-fns` (al aanwezig) en bestaande shadcn-componenten (Tabs, Sheet, Popover, Badge, Button, Card).
- Nieuw: `src/components/planning-calendar/` met `PlanningCalendar.tsx` (state: view + ankerdatum), `DayGrid.tsx`, `WeekGrid.tsx`, `MonthGrid.tsx`, `YearGrid.tsx`, `EventBlock.tsx`, `calendar-utils.ts` (periodegrenzen, groeperen per dag, overlap-layout).
- `src/routes/_authenticated/overzicht.index.tsx`: Tabs "Kalender" / "Lijst"; in kalendermodus worden `from`/`to` in de bestaande `getActivityOverview`-filters gezet op de zichtbare periode (jaar → volledig jaar), zodat de query per periode laadt en gecached wordt per bereik.
- Statuskleuren en typekleuren via bestaande semantische tokens uit `src/styles.css` en `activity_types.color`; geen hardcoded kleurklassen.
- Geen wijzigingen aan database, server functions of de PHP-versie in deze stap.
