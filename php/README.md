# Planning systeem — PHP/MySQL versie (cPanel)

Zelf-hostbare variant van de Lovable planning-app. Feature-pariteit:
rollen (admin/management/employee), activiteiten met types, sjablonen,
e-mail + web-push + in-app meldingen, WebAuthn (vingerafdruk) login,
audit-log, management-overzicht met filters, auto-escalatie via cron.

## Installatie op cPanel

1. **Database aanmaken**
   - cPanel → MySQL Databases → maak database + user (all privileges).
   - Import `config/schema.sql` via phpMyAdmin, daarna optioneel `config/seed.sql`.

2. **Bestanden uploaden**
   - Upload de volledige `php/` map naar bijv. `/home/USER/planning/`.
   - Zet in cPanel de **document root** van je (sub)domein op
     `/home/USER/planning/public`.

3. **Config invullen**
   - Kopieer `config/config.example.php` naar `config/config.php`.
   - Vul in: DB-gegevens, SMTP (mailserver van cPanel), `APP_URL`,
     `APP_SECRET` (willekeurige 32+ tekens), VAPID sleutels.
   - VAPID genereren: `php -r "require 'vendor/autoload.php'; print_r(Minishlink\\WebPush\\VAPID::createVapidKeys());"`.

4. **Composer**
   - Via cPanel Terminal of SSH:
     ```
     cd /home/USER/planning
     composer install --no-dev
     ```
   - Nodig: `phpmailer/phpmailer`, `minishlink/web-push`.

5. **Eerste admin**
   - Ga naar `https://<jouwdomein>/register`. De eerste account krijgt
     automatisch de rol `admin`. Daarna kun je in Beheer verdere gebruikers
     aanmaken en hun rol instellen.

6. **Cronjobs (cPanel → Cron Jobs)**
   - Auto-escalatie elke 5 minuten:
     ```
     */5 * * * * /usr/bin/php /home/USER/planning/cron/auto_escalate.php
     ```
   - Herinneringen (optioneel) elke 15 minuten:
     ```
     */15 * * * * /usr/bin/php /home/USER/planning/cron/send_reminders.php
     ```

## Requirements

- PHP 8.1+
- MySQL 5.7+ / MariaDB 10.4+
- PHP extensies: `pdo_mysql`, `openssl`, `mbstring`, `gmp` (voor web-push).
- HTTPS (nodig voor WebAuthn en Web Push).

## Structuur

```
php/
  config/       schema.sql, seed.sql, config.example.php
  public/       document root (index.php, assets, sw.js)
  src/          PHP klassen (Auth, Db, Router, Controllers, Models, Views)
  cron/         CLI scripts
  vendor/       (composer install)
```

## Beveiliging

- Wachtwoorden: `password_hash` (bcrypt).
- CSRF-token op alle POST-formulieren.
- Sessie-cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
- Rollen worden bij elke request opnieuw gecontroleerd, nooit uit de sessie.
- Tokens voor e-mail-respond zijn eenmalig en verlopen na `respond_by`.
