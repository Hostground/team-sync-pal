
# Planning-systeem — Lovable + PHP/MySQL (cPanel)

Twee parallelle implementaties met identiek datamodel en dezelfde workflow.

## Rollen & rechten

- **Beheerder (admin)**: gebruikers beheren, activiteitstypes/sjablonen beheren, systeeminstellingen (o.a. bevestigingstermijn), alles zien, meldingsstatus van iedereen zien.
- **Management**: activiteiten aanmaken/wijzigen, medewerker toewijzen, sjablonen beheren, overzicht van alle planningen, meldingsstatus van eigen verzonden meldingen zien.
- **Medewerker**: eigen planning zien, bevestigen/weigeren binnen de termijn, eigen meldingen lezen.

## Workflow activiteit

1. Management maakt activiteit (nieuw of vanuit **sjabloon**) en kiest 1 medewerker.
2. Status wordt `pending`. `respond_by = now() + response_window` (instelbaar, override per activiteit).
3. Medewerker krijgt **e-mail + push + in-app** melding met bevestig/weiger acties.
4. Reactie:
   - Bevestigd → `confirmed`, management krijgt bevestiging.
   - Geweigerd → `declined` (+ optionele reden), management krijgt melding.
5. Geen reactie vóór `respond_by` → cron zet op `auto_declined`, management krijgt melding.
6. Management kan opnieuw plannen.

## Authenticatie & login

- **E-mail + wachtwoord** (basis).
- **Google sign-in** (Lovable versie).
- **Vingerafdruk / passkey (WebAuthn)** — optioneel, per gebruiker in te schakelen na eerste normale login:
  - Lovable versie: WebAuthn via `@simplewebauthn/server` + `@simplewebauthn/browser`, credentials opgeslagen in `webauthn_credentials` tabel gelinkt aan `auth.users`.
  - PHP versie: `web-auth/webauthn-lib` (Composer), zelfde tabelstructuur.
  - Gebruiker: Instellingen → "Beveiliging" → "Vingerafdruk/passkey toevoegen" (registreert device). Bij login verschijnt knop "Inloggen met vingerafdruk" naast wachtwoordformulier.
  - Meerdere devices per gebruiker; elk device benoembaar en intrekbaar.
  - Fallback wachtwoord blijft altijd werken.

## Meldingen: kanalen + tracking

Drie kanalen, per gebruiker aan/uit in profielinstellingen (default: alle aan):

1. **E-mail** — Lovable managed email / PHPMailer.
2. **Web push** — Web Push API + service worker (VAPID keys). PHP versie: `minishlink/web-push` library. Werkt op desktop en Android; iOS vereist geïnstalleerde PWA (uitleg in app).
3. **In-app** — bell-icon met ongelezen-badge, realtime (Lovable) of polling elke 30s (PHP).

### Tracking per melding-verzending

Elke uitgaande melding krijgt een rij in `notification_deliveries` met:
- `channel` (email / push / inapp)
- `status` (queued → sent → delivered → read / failed / bounced)
- `sent_at`, `delivered_at`, `read_at`, `error`
- Push: `delivered_at` via service worker die ping terugstuurt naar `/api/notifications/{id}/ack`.
- E-mail: `delivered_at`/bounced via Lovable email webhook (`src/routes/lovable/email/events.ts`). PHP versie: alleen `sent` + eventuele SMTP-fout; delivered zonder webhook-provider onbekend (duidelijk aangegeven in UI).
- In-app + push: `read_at` gezet wanneer gebruiker de melding opent.

### Wie ziet wat

- **Medewerker**: eigen inbox met ongelezen/gelezen state.
- **Management**: per verzonden activiteit een panel "Meldingsstatus" — per kanaal een badge (Verzonden / Afgeleverd / Gelezen / Mislukt) met tijdstip. Handig om te zien of de medewerker de melding echt gekregen heeft.
- **Admin**: `/admin/notifications` — globaal overzicht + filters (gebruiker, status, kanaal, periode), rebounce-teller, faalpercentage per kanaal.

## Activiteiten: flexibele types + sjablonen

- **Activity types** zelf-configureerbaar door admin (naam, kleur, icoon) — bv. Keuken, Werk buiten, …
- Vaste velden: titel, type, medewerker, start, eind, locatie (optioneel), omschrijving, notities.
- **Sjablonen**: management slaat een activiteit op als sjabloon → "Kies sjabloon" pre-vult formulier.

## Instellingen (admin)

- Standaard responstermijn (default 24u), min/max, override per activiteit ja/nee.
- Herinneringsmail/push X uur voor `respond_by` (default 2u).
- VAPID keys (push) — auto-gegenereerd bij eerste boot.
- SMTP-config (PHP) / e-maildomein (Lovable).
- Push-, e-mail-, in-app-defaults voor nieuwe gebruikers.

---

## Lovable versie (React + TanStack Start + Cloud)

- Cloud aan (Supabase onder de motorkap) voor auth, DB, realtime, cron (pg_cron).
- **Auth**: e-mail/wachtwoord + Google + WebAuthn passkey (via server functions die challenge maken/verifiëren).
- **Routes**:
  - `/auth` — login (wachtwoord / Google / passkey knop) + registratie
  - `/_authenticated/planning` — kalender/lijst
  - `/_authenticated/planning/new`, `/planning/$id`
  - `/_authenticated/templates`
  - `/_authenticated/notifications` — eigen inbox
  - `/_authenticated/settings/security` — passkeys beheer + meldingsvoorkeuren
  - `/_authenticated/admin/{users,activity-types,settings,notifications}`
  - `/api/public/respond/$token` — publieke bevestig/weiger uit e-mail
  - `/api/public/push/ack` — push delivery ack vanuit service worker
  - `/api/public/cron/{auto-decline,reminders}` — met `CRON_SECRET`
  - `/lovable/email/events` — bounce/complaint webhook
- Service worker in `public/sw.js` voor push.

## PHP/MySQL versie (cPanel)

- **Stack**: PHP 8.1+, MySQL/MariaDB, PDO, kleine eigen router. Composer: PHPMailer, `web-auth/webauthn-lib`, `minishlink/web-push`.
- **Structuur**:
  ```
  /public_html/
    index.php, .htaccess, sw.js, assets/
  /app/
    Controllers/  Models/  Views/  Core/  Middleware/  Notifications/
    config.php
  /db/schema.sql
  /cron/auto_decline.php, reminders.php
  ```
- Sessies + CSRF, role-check middleware, PHPMailer via SMTP.
- Web push via `minishlink/web-push` met VAPID keys uit `settings` tabel.
- `install.php` wizard → DB, admin-account, VAPID auto-generatie, schema-import.

---

## Gedeeld schema (kern)

```sql
users(id, email, password_hash, name, role, active, notif_email, notif_push, notif_inapp, created_at)
activity_types(id, name, color, icon, active)
activities(
  id, title, type_id, assignee_id, created_by,
  start_at, end_at, location, description,
  status ENUM('pending','confirmed','declined','auto_declined','cancelled'),
  respond_by, responded_at, response_note,
  template_id NULL, created_at, updated_at
)
activity_templates(id, name, type_id, title, location, description, duration_minutes, created_by)
response_tokens(token PK, activity_id, action, expires_at, used_at)

notifications(id, user_id, activity_id NULL, type, title, body, created_at)
notification_deliveries(
  id, notification_id, channel ENUM('email','push','inapp'),
  status ENUM('queued','sent','delivered','read','failed','bounced'),
  sent_at, delivered_at, read_at, error, provider_message_id
)

webauthn_credentials(id, user_id, credential_id, public_key, sign_count, device_name, created_at, last_used_at)
push_subscriptions(id, user_id, endpoint, p256dh, auth, user_agent, created_at, last_seen_at)

settings(key PK, value)  -- default_response_window_hours, reminder_hours_before, smtp_*, vapid_public, vapid_private, allow_override
email_log(id, ...)  -- vervangen door notification_deliveries; blijft optioneel voor debug
```

Indexen: `activities(assignee_id, start_at)`, `activities(status, respond_by)`, `notification_deliveries(notification_id)`, `notification_deliveries(status, channel)`.

## Cron / achtergrondtaken

- **Auto-decline** (elke 5 min): pending met `respond_by < now()` → auto_declined + melding management.
- **Reminders** (elk uur): pending binnen `reminder_hours` en nog niet herinnerd.
- Lovable: pg_cron → `/api/public/cron/*` met `CRON_SECRET`.
- PHP: cPanel Cron Jobs.

## Leverbaar

- Werkende Lovable-app (Cloud aan; gebruiker configureert e-maildomein).
- Downloadbaar `php-app/` mapje in de repo met `schema.sql`, `README.md` (cPanel install-stappen), install-wizard en volledige source.

## Bouwvolgorde

1. Cloud aan + schema + rollen + basis auth (Lovable).
2. Activity types + templates + activiteiten CRUD + rol-gefilterde views.
3. Bevestig/weiger flow + tokens + e-mails + in-app meldingen + deliveries tracking.
4. Web push (VAPID, service worker, subscribe, ack).
5. Passkey / vingerafdruk registratie + login.
6. Meldings-dashboards voor management + admin.
7. Cron auto-decline + reminders + admin-instellingen.
8. PHP-versie: schema + auth + WebAuthn + push + zelfde flow + install wizard.

## Defaults (laat weten als anders gewenst)

- Responstermijn 24u, override aan. Reminder 2u vooraf.
- Kalender: week + maand + lijst. Taal: Nederlands.
- Alle 3 meldingskanalen default aan per nieuwe gebruiker.
