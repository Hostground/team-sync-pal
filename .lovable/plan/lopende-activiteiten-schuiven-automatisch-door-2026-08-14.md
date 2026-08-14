# Lopende activiteiten (schuiven automatisch door)

Een activiteit kan gemarkeerd worden als **lopende activiteit**. Is ze aan het einde van de dag niet afgerond, dan schuift ze automatisch één dag op (zelfde uren) tot ze afgerond is. Elke verschuiving komt in de audit-log; er gaan geen meldingen uit.

## Gedrag

- Bij het plannen (en bij bewerken) kan management "Lopende activiteit" aanzetten.
- Afronden kan op twee manieren:
  - Knop "Afronden" op de activiteit (toegewezen medewerker + management/admin).
  - Automatisch zodra alle taken in de takenlijst afgevinkt zijn (en er minstens één taak is).
- Afgeronde activiteiten krijgen status **Afgerond** met tijdstempel en schuiven niet meer door.
- Doorschuiven gebeurt via de bestaande cron (elke 5 min): is `eind` voorbij en de activiteit niet afgerond of geannuleerd, dan gaan start- en einddatum +1 dag. De bevestigingstermijn schuift mee zolang de activiteit nog op "in afwachting" staat, zodat een lopende activiteit niet automatisch geweigerd wordt.
- Elke verschuiving logt een audit-regel met oude en nieuwe datum, plus een teller "aantal keer doorgeschoven".

## Zichtbaarheid

- Badge "Lopend" op de activiteit in lijst, detail en kalender; bij doorgeschoven activiteiten "x× doorgeschoven".
- Status "Afgerond" krijgt eigen kleur in lijst, filters en kalender.
- Overzichtspagina: filter op status Afgerond en op lopende activiteiten.

## Beide versies

Zelfde functionaliteit in de Lovable-app en de PHP/MySQL-versie; de download-zip van de PHP-versie wordt daarna vernieuwd.

## Technische details

Database (migratie + `php/config/schema.sql`):
- `activities`: `is_rolling boolean not null default false`, `completed_at timestamptz`, `completed_by uuid`, `rollover_count int not null default 0`, `original_start_at timestamptz`.
- Enum `activity_status`: waarde `completed` toevoegen.
- Enum `audit_action`: waarden `completed`, `rolled_over` toevoegen (PHP: kolom uitbreiden).

Lovable:
- `src/lib/planning.functions.ts`: `is_rolling` in create/update-validator; nieuwe `completeActivity` (rechten: assignee of management/admin) die status, `completed_at/by` zet en audit logt; checklist-afvink-actie controleert of alle items klaar zijn en rondt dan af.
- `src/routes/api/public/hooks/auto-escalate.ts`: extra stap die lopende, niet-afgeronde activiteiten met `end_at < now()` doorschuift (+1 dag op `start_at`/`end_at`, en `respond_by` als status nog `pending`), `rollover_count` verhoogt en `rolled_over` audit-regels schrijft. Auto-declineer-stap slaat lopende activiteiten over.
- UI: schakelaar in het plan-formulier, "Afronden"-knop op detail, badges/kleuren in `planning.index.tsx`, `planning.$id.tsx`, `overzicht.index.tsx` en `calendar-utils.ts`, plus de bestaande checklist-component.

PHP:
- `PlanningController.php`: veld `is_rolling`, actie `complete`, checklist-hook in `ChecklistController.php`.
- `cron/auto_escalate.php`: rollover-blok met dezelfde regels + `Audit::log(..., 'rolled_over', ...)`, zonder notificaties.
- Views/CSS: schakelaar, afrond-knop, badges en statuskleur voor "Afgerond".
