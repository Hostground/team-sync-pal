
## Doel

1. Een uitgebreide, Nederlandstalige **stap-voor-stap cPanel installatiegids** toevoegen aan het project.
2. De volledige `php/` map inpakken tot een **downloadbare ZIP** en die als artifact leveren zodat je hem direct kunt downloaden. Daarnaast wordt de ZIP ook in het project bewaard zodat hij mee gesynct wordt naar Git.

## Wat wordt aangemaakt / gewijzigd

### 1. Installatiegids
Nieuw bestand: `php/INSTALL_CPANEL.md` — gedetailleerde gids met screenshots-uitleg en commando's. Onderdelen:

1. **Voorbereiding**
   - Vereisten (PHP 8.1+, MySQL/MariaDB, HTTPS, cPanel toegang, SSH/Terminal aanbevolen)
   - Benodigde PHP-extensies checken (`pdo_mysql`, `openssl`, `mbstring`, `gmp`) via **cPanel → Select PHP Version**
2. **Bestanden uploaden**
   - Optie A: via **File Manager** (ZIP uploaden naar `/home/USER/`, uitpakken)
   - Optie B: via SSH (`scp` / `git clone`)
   - Aanbevolen doelmap: `/home/USER/planning/`
3. **Database aanmaken**
   - **cPanel → MySQL Databases** → database + user + koppelen (ALL PRIVILEGES)
   - Import `config/schema.sql` via **phpMyAdmin**
   - Optioneel `config/seed.sql`
4. **(Sub)domein koppelen met juiste document root**
   - **cPanel → Domains** → subdomein aanmaken (bv. `planning.jouwdomein.be`)
   - Document root instellen op `/home/USER/planning/public` (belangrijk i.v.m. beveiliging)
5. **Config invullen**
   - `cp config/config.example.php config/config.php`
   - Uitleg per veld: `app.url`, `app.secret` (32+ random), DB-gegevens, SMTP (mag leeg blijven — kan later via UI), VAPID keys, WebAuthn `rp_id`
   - Commando's om `app.secret` en VAPID keys te genereren
6. **Composer dependencies**
   - Via **cPanel → Terminal**: `cd ~/planning && composer install --no-dev`
   - Alternatief als Composer ontbreekt: `curl -sS https://getcomposer.org/installer | php`
7. **HTTPS activeren**
   - **cPanel → SSL/TLS Status** → AutoSSL uitvoeren (verplicht voor WebAuthn + Web Push)
8. **Eerste keer opstarten**
   - `https://planning.jouwdomein.be/register` → eerste account = admin
   - Daarna in **Beheer → SMTP** de mailserver invullen en een testmail sturen
   - **Beheer → Gebruikers** om rollen toe te kennen
   - **Beheer → Types** om activiteitstypes aan te maken
9. **Cronjobs instellen**
   - **cPanel → Cron Jobs** → twee entries met exact pad naar `php`-binary:
     - `*/5 * * * * /usr/local/bin/php /home/USER/planning/cron/auto_escalate.php`
     - `*/15 * * * * /usr/local/bin/php /home/USER/planning/cron/send_reminders.php`
   - Hoe het juiste PHP-pad vinden (`which php` of cPanel PHP-version pad)
10. **Beveiliging & aanbevelingen**
    - `config/config.php` buiten document root (staat er al)
    - File permissions (644 files / 755 dirs)
    - Backup: cPanel → Backup Wizard
11. **Veelvoorkomende problemen (Troubleshooting)**
    - 500 error → error log in cPanel
    - "class not found" → composer install vergeten
    - WebAuthn werkt niet → HTTPS/rp_id check
    - Push notificaties werken niet → VAPID keys ontbreken
    - Mails komen niet aan → SMTP-test knop + spam/SPF/DKIM

`php/README.md` krijgt een korte verwijzing naar `INSTALL_CPANEL.md`.

### 2. Downloadbare ZIP

- Een script in de sandbox pakt de volledige `php/` map in tot `planning-php.zip` (exclusief `vendor/` en `config/config.php` als die zouden bestaan).
- De ZIP wordt op **twee** plekken bewaard:
  - `/mnt/documents/planning-php.zip` — direct downloadbaar via het `<presentation-artifact>` blok in de reply.
  - `php-download/planning-php.zip` in het project — zodat de ZIP mee gaat in Git-sync en later opnieuw te downloaden is via de Code Editor.
- ZIP bevat ook `INSTALL_CPANEL.md` in de root van het archief.

## Buiten scope

- Geen wijzigingen aan de Lovable/React app.
- Geen wijzigingen aan schema, controllers of businesslogica — enkel documentatie + verpakking.
