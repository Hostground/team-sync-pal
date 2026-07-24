## Doel

Voeg een audit-log toe voor bevestigen/weigeren van activiteiten en een overzichtspagina voor management/admin met filters op meldingsstatus per activiteit. Beide worden geïmplementeerd in de Lovable-app én meegenomen in het PHP/MySQL-schema.

## 1. Database (Lovable Cloud migratie)

Nieuwe tabel `activity_audit_log`:
- `activity_id` (FK activities)
- `actor_id` (FK auth.users) — wie de actie deed
- `action` (enum: `confirmed`, `declined`, `auto_declined`, `cancelled`, `rescheduled`)
- `note` (text, optioneel) — reden/nota
- `previous_status`, `new_status` (activity_status)
- `created_at`

RLS:
- INSERT: alleen via server functions (service role) — geen policy voor `authenticated`.
- SELECT: eigen rijen (`actor_id = auth.uid()`), of de assignee/creator van de activiteit, of admin/management via `has_role`.
- GRANT SELECT/INSERT aan `authenticated`, ALL aan `service_role`.

## 2. Server functions

`src/lib/planning.functions.ts`:
- `respondActivity`: bij succesvol update een rij in `activity_audit_log` schrijven (`actor_id = userId`, `action = confirm|decline`, `note`, previous/new status).
- Nieuwe `getActivityOverview` (staff-only): geeft alle activiteiten terug met geaggregeerde meldingsstatus (aantal per kanaal: verzonden, gelezen) + laatste audit-actie. Filters: status, datumbereik, medewerker, activity_type, alleen ongeziene.
- Nieuwe `getActivityAuditLog`: audit-rijen per activiteit (staff-only).

Auto-decline cron (later) schrijft óók naar `activity_audit_log` met `action='auto_declined'`.

## 3. UI

**Nieuwe route** `src/routes/_authenticated/overzicht.index.tsx` (management/admin):
- Filters bovenaan: status (pending/confirmed/declined/auto_declined), datumbereik, medewerker, activity_type, "alleen ongelezen meldingen".
- Tabel/lijst per activiteit met kolommen: titel, medewerker, start, status, meldingsstatus-badges (email/push/inapp: queued/sent/read), laatste audit-actie.
- Detailpaneel/expand met alle `notification_deliveries` per melding en de volledige audit-log.
- Link naar `/planning/$id`.

**Update** `src/routes/_authenticated/planning.$id.tsx`:
- Extra sectie "Geschiedenis" voor staff: toont audit-log rijen (wie, wat, wanneer, nota).

**Update** `src/components/AppShell.tsx`:
- Navigatie-item "Overzicht" toevoegen, alleen zichtbaar voor admin/management.

## 4. PHP/MySQL versie

Uitbreiding van het geplande MySQL-schema:
- Tabel `activity_audit_log` met dezelfde kolommen (`activity_id`, `actor_id`, `action` ENUM, `note`, `previous_status`, `new_status`, `created_at`).
- FKs met `ON DELETE CASCADE` naar `activities`, `ON DELETE SET NULL` naar `users`.
- Index op `(activity_id, created_at)`.

PHP endpoints/pagina's:
- `respond.php`: schrijft na status-update een audit-rij.
- `cron_auto_decline.php`: schrijft audit-rij met `auto_declined`.
- `overzicht.php`: staff-only pagina met dezelfde filters en samengevoegde melding/audit-weergave (server-side render, GET-filters).
- `activity.php`: geschiedenis-sectie voor staff.

## Technische details

- `previous_status`/`new_status` maken later rapportage mogelijk (bv. hoeveel keer omgezet van pending→confirmed).
- Bestaande `notifications` + `notification_deliveries` blijven de bron voor meldingsstatus; het overzicht joint hierop, geen duplicatie.
- Audit-rij wordt in dezelfde server-fn geschreven als de status-update; bij fout op audit wordt de request niet gefaald (log & doorgaan) om te vermijden dat een geldige bevestiging omvalt.
- Staff-check via bestaande `has_role`/`assertStaff`-patroon.
