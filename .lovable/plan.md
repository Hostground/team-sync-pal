## Plan: Auto-escalatie cron + PHP/MySQL versie

### Deel 1 — Auto-escalatie (Lovable app)

**Doel:** Activiteiten met status `pending` waarvan de bevestigingstermijn is verstreken, automatisch op `auto_declined` zetten, een audit-regel schrijven, en het management notificeren.

1. **Instelling voor termijn** — kolom `confirm_deadline_hours` op `activities` (of afleiden uit `settings` tabel met een globale default, bv. 24u). Bij het aanmaken van een activiteit wordt `confirm_deadline_at` berekend en opgeslagen.
2. **Server route** `src/routes/api/public/hooks/auto-escalate.ts` (POST):
   - Verifieert `apikey` header (Supabase anon key).
   - Zoekt alle `pending` activiteiten waar `confirm_deadline_at < now()`.
   - Zet status → `auto_declined`, schrijft `activity_audit_log` (action `auto_declined`), maakt notificaties aan voor alle management + admins.
3. **pg_cron job** — elke 5 minuten `net.http_post` naar de bovenstaande route.
4. **UI** — badge/label "Verlopen" op de overzichtspagina en detailpagina; kolom `confirm_deadline_at` tonen; management kan alsnog handmatig herplannen.

### Deel 2 — PHP/MySQL versie (zelf-hosted op cPanel)

Nieuwe map `php/` naast de bestaande Lovable-app. Werkt volledig standalone.

**Structuur:**
```text
php/
  README.md                installatie-instructies (cPanel, SMTP, cron)
  config/
    config.example.php     DB, SMTP, VAPID, app-URL
    schema.sql             volledig MySQL schema
    seed.sql               demo activiteitstypes
  public/                  document root voor cPanel
    index.php              front controller / router
    assets/                css, js (bell, WebAuthn, push subscribe)
    sw.js                  service worker voor push
  src/
    Auth.php               login, sessies, WebAuthn register/assert
    Db.php                 PDO wrapper
    Mailer.php             PHPMailer via SMTP
    Push.php               web-push (VAPID) via minimalistische lib of composer
    Router.php
    Csrf.php
    Controllers/
      AuthController.php
      PlanningController.php
      TemplateController.php
      NotificationController.php
      OverviewController.php
      AdminController.php
      ApiController.php    respond-token endpoint, mark-read, subscribe
    Models/ (Activity, User, Role, Notification, AuditLog, Template, Type)
    Views/                 PHP templates (layout + per pagina)
  cron/
    auto_escalate.php      CLI script, uitgevoerd via cPanel cron elke 5 min
    send_reminders.php     optioneel: herinnering vlak voor deadline
  vendor/                  composer install output (PHPMailer, web-push)
  composer.json
```

**MySQL schema** (`config/schema.sql`) — 1-op-1 met de Supabase-tabellen:
- `users` (id, email, password_hash, full_name, phone, biometric_enabled, notif_email/push/inapp, created_at)
- `user_roles` (user_id, role ENUM admin/management/employee)
- `activity_types`, `activities` (incl. `confirm_deadline_at`, `status` ENUM)
- `activity_templates`
- `notifications`, `notification_deliveries` (kanaal ENUM email/push/inapp, status, read_at)
- `response_tokens` (voor e-mail bevestig/weiger links)
- `webauthn_credentials`
- `push_subscriptions` (endpoint, p256dh, auth)
- `activity_audit_log` (action ENUM confirmed/declined/auto_declined/rescheduled/created)
- `settings` (key/value voor globale defaults, VAPID public/private)

**Functionaliteit pariteit met Lovable-app:**
- Login e-mail/wachtwoord + optionele WebAuthn (server-side challenge, opslag public key).
- Rollen: admin, management, employee (middleware in Router).
- Management maakt activiteit → medewerker krijgt e-mail (met tokenlink `/api/respond?token=…`) + web-push + in-app bell.
- Medewerker bevestigt/weigert (met optionele nota) via web of e-maillink → audit-log entry.
- Sjablonen opslaan/hergebruiken.
- Overzichtspagina met dezelfde filters (status, medewerker, type, datum, ongelezen) + per-activiteit meldingsstatus + uitklapbare audit-log.
- Instellingen per gebruiker (notificatie-kanalen, WebAuthn).
- Admin: gebruikersbeheer, rollen, activiteitstypes.

**Cron (`cron/auto_escalate.php`):**
- Draait via cPanel-cronjob: `*/5 * * * * /usr/bin/php /home/USER/planning/php/cron/auto_escalate.php`.
- Zelfde logica als de server route: verlopen → `auto_declined`, audit-log, notificatie naar management.

**Deliverables PHP-tak:**
- Volledig schema + seed.
- Alle controllers/views voor pariteit.
- `README.md` met stappen: DB aanmaken, `config.php` invullen, `composer install`, VAPID sleutels genereren, cronjobs instellen, cPanel document root wijzen naar `public/`.

### Volgorde van uitvoering

1. Migratie: kolom `confirm_deadline_at` + default in `settings`.
2. Server route `auto-escalate` + pg_cron.
3. UI-badges "Verlopen".
4. PHP: schema + config + Router/Auth/Db basis.
5. PHP: planning, templates, notifications, overzicht, admin.
6. PHP: WebAuthn + push + e-mail.
7. PHP: cron scripts + README.

### Open punt

Standaard bevestigingstermijn — voorstel: **24 uur**, per activiteit overschrijfbaar door management bij aanmaken. OK zo, of liever een andere default?
