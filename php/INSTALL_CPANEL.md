# Installatiegids — Planning (PHP/MySQL) op cPanel

Stap-voor-stap gids om de PHP-versie van het planningsysteem te installeren op een
cPanel server. Reken op ± 20–30 minuten.

> Vervang overal `USER` door je cPanel gebruikersnaam, en
> `planning.jouwdomein.be` door het (sub)domein dat je gaat gebruiken.

---

## 1. Voorbereiding

**Vereisten**

- cPanel-hosting met SSH of **Terminal** toegang (aanbevolen, niet strict verplicht).
- **PHP 8.1 of hoger**.
- **MySQL 5.7+** of **MariaDB 10.4+**.
- **HTTPS** actief op het (sub)domein (verplicht voor WebAuthn/vingerafdruk en Web Push).
- Composer op de server (bijna alle cPanel hosts hebben dit; anders zie stap 6).

**PHP-extensies controleren**

1. cPanel → **Select PHP Version** (of *MultiPHP Manager*).
2. Kies PHP **8.1** of hoger voor het account.
3. Zorg dat volgende extensies aangevinkt staan:
   - `pdo_mysql`
   - `openssl`
   - `mbstring`
   - `gmp` (nodig voor Web Push / VAPID)
   - `curl`
   - `zip`

Sla op.

---

## 2. Bestanden uploaden

Kies één van de opties. Doelmap: `/home/USER/planning/`.

### Optie A — via File Manager (zonder SSH)

1. Download `planning-php.zip` (deze staat als artifact bij dit bericht, en in de projectmap `php-download/`).
2. cPanel → **File Manager** → ga naar `/home/USER/`.
3. Upload `planning-php.zip`.
4. Rechtsklik → **Extract**. De inhoud komt in `/home/USER/planning/`.
   (Als het uitpakt naar `planning-php/`, hernoem die map naar `planning`.)

### Optie B — via SSH / Terminal

```bash
cd ~
# upload de zip eerst via scp of File Manager
unzip planning-php.zip -d planning
```

Of via Git (als je project op GitHub staat):

```bash
cd ~
git clone https://github.com/JOUW/REPO.git planning
```

---

## 3. Database aanmaken

1. cPanel → **MySQL® Databases**.
2. Maak een nieuwe database aan, bv. `USER_planning`.
3. Maak een nieuwe user aan, bv. `USER_plan`, met een sterk wachtwoord — bewaar dit.
4. Koppel de user aan de database met **ALL PRIVILEGES**.
5. Ga naar **phpMyAdmin** → selecteer je nieuwe database → tab **Import** →
   kies `~/planning/config/schema.sql` → **Go**.
6. Optioneel: importeer daarna `~/planning/config/seed.sql` op dezelfde manier
   voor een set voorbeeldgegevens (types, e.d.).

---

## 4. (Sub)domein koppelen

Het is **belangrijk** dat het domein wijst naar de `public/` map, zodat
`config/`, `src/` en `vendor/` nooit publiek te zien zijn.

1. cPanel → **Domains** (of **Subdomains**).
2. Maak `planning.jouwdomein.be` aan.
3. Zet **Document Root** op:
   ```
   /home/USER/planning/public
   ```
4. Bewaar.

---

## 5. HTTPS activeren

1. cPanel → **SSL/TLS Status**.
2. Vink het (sub)domein aan → **Run AutoSSL**.
3. Wacht tot het certificaat groen is. Test `https://planning.jouwdomein.be`.

Zonder HTTPS werken vingerafdruk-login (WebAuthn) en Web Push **niet**.

---

## 6. Composer dependencies installeren

Open cPanel → **Terminal** (of via SSH):

```bash
cd ~/planning
composer install --no-dev
```

Werkt `composer` niet? Installeer hem lokaal:

```bash
cd ~/planning
curl -sS https://getcomposer.org/installer | php
php composer.phar install --no-dev
```

Dit maakt de map `vendor/` aan met PHPMailer, Web-Push, e.d.

---

## 7. Config invullen

```bash
cd ~/planning
cp config/config.example.php config/config.php
nano config/config.php     # of via File Manager → Edit
```

Vul in:

- **`app.url`** — volledige URL zonder trailing slash, bv.
  `https://planning.jouwdomein.be`.
- **`app.secret`** — willekeurige string van 32+ tekens. Genereer met:
  ```bash
  php -r "echo bin2hex(random_bytes(32));"
  ```
- **`app.timezone`** — bv. `Europe/Brussels`.
- **`db.host` / `db.name` / `db.user` / `db.pass`** — de gegevens uit stap 3.
- **`smtp.*`** — mag je **leeg laten**. Je kan dit later invullen via
  **Beheer → SMTP** in de app (aanbevolen).
- **`vapid.publicKey` / `vapid.privateKey`** — nodig voor Web Push.
  Genereer met:
  ```bash
  cd ~/planning
  php -r "require 'vendor/autoload.php'; print_r(Minishlink\WebPush\VAPID::createVapidKeys());"
  ```
  Kopieer beide keys in de config. `vapid.subject` = `mailto:jij@jouwdomein.be`.
- **`webauthn.rp_id`** — enkel de hostname, dus `planning.jouwdomein.be`
  (zonder `https://` en zonder pad).
- **`webauthn.rp_name`** — leesbare naam die in de vingerafdruk-prompt komt.

Zet daarna permissies:

```bash
chmod 600 config/config.php
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod 600 config/config.php
```

---

## 8. Eerste keer opstarten

1. Ga naar `https://planning.jouwdomein.be/register`.
2. Registreer het **eerste** account — dit krijgt automatisch de rol **admin**.
3. Log in.
4. Ga naar **Beheer → SMTP** en vul de mailserver in (host, poort, gebruiker,
   wachtwoord, afzender). Bij de meeste cPanel-hosts:
   - Host: `mail.jouwdomein.be` (of `localhost`)
   - Poort: `587` — Secure: `tls`
   - Gebruiker: een mailbox die je in cPanel aanmaakte, bv. `noreply@jouwdomein.be`
5. Klik **Testmail versturen** om te controleren of e-mail werkt.
6. **Beheer → Gebruikers** → nodig medewerkers/management uit (of laat ze zelf
   registreren) en zet hun rol.
7. **Beheer → Types** → maak activiteitstypes aan (bv. Keuken, Buitenwerk).

---

## 9. Cronjobs instellen

De app heeft twee terugkerende taken:

- **Auto-escalatie** — verlopen bevestigingen automatisch weigeren.
- **Herinneringen** — X uur voor de deadline een reminder sturen.

Zoek eerst het volledige pad naar `php`:

```bash
which php
# meestal: /usr/local/bin/php  of  /usr/bin/php  of iets als
# /opt/cpanel/ea-php81/root/usr/bin/php
```

Ga dan naar **cPanel → Cron Jobs** en voeg toe:

**Auto-escalatie (elke 5 minuten)**

```
*/5 * * * * /usr/local/bin/php /home/USER/planning/cron/auto_escalate.php >/dev/null 2>&1
```

**Herinneringen (elke 15 minuten)**

```
*/15 * * * * /usr/local/bin/php /home/USER/planning/cron/send_reminders.php >/dev/null 2>&1
```

Vervang `/usr/local/bin/php` door wat `which php` gaf, en `USER` door je cPanel gebruiker.

---

## 10. Beveiliging & aanbevelingen

- `config/config.php` staat **buiten** de document root (`public/`) — laat dat zo.
- Extra beveiligd via `.htaccess`: directe toegang tot `config.php` wordt geweigerd.
- Bestandsrechten: 644 voor files, 755 voor mappen, `config.php` op 600.
- Maak regelmatig een backup: **cPanel → Backup Wizard**.
- Log in op **HTTPS**. Log-in via HTTP faalt bewust voor WebAuthn.
- Wachtwoorden: minimaal 10 tekens, letter + cijfer (server-side afgedwongen).
- Houd PHP en Composer up-to-date (`composer update` gevolgd door test op staging).

---

## 11. Troubleshooting

| Probleem | Oplossing |
|---|---|
| **500 Internal Server Error** | cPanel → **Errors** (of `~/logs/`) bekijken. Meestal: `config.php` ontbreekt, verkeerde PHP-versie, of `vendor/` niet aangemaakt. |
| **"Class not found"** | `composer install --no-dev` opnieuw uitvoeren in `~/planning`. |
| **Login pagina laadt niet / 404 overal** | Document root moet naar `.../planning/public` wijzen, niet naar `.../planning`. |
| **WebAuthn (vingerafdruk) werkt niet** | Site moet via **HTTPS** draaien. `webauthn.rp_id` moet exact de hostname zijn (zonder scheme). |
| **Web Push werkt niet** | VAPID keys ingevuld? Service worker `sw.js` bereikbaar via `/sw.js`? Browser moet notificatie-permissie hebben gegeven. |
| **Mails komen niet aan** | Klik **Testmail** in Beheer → SMTP. Controleer spamfolder. Stel SPF/DKIM in via cPanel → **Email Deliverability**. |
| **Cronjobs draaien niet** | Zeker weten `which php`-pad juist is. Test manueel: `/usr/local/bin/php /home/USER/planning/cron/auto_escalate.php`. |
| **Database connection failed** | Controleer of de MySQL-user aan de database gekoppeld is met ALL PRIVILEGES (stap 3). |

---

Klaar! Bij vragen: check eerst de error log in cPanel, dan `~/planning/config/config.php`,
en dan de tabel `activity_audit_log` in phpMyAdmin voor het spoor van elke actie.

## Update: lopende activiteiten (rolling)

Draai deze SQL eenmalig op een bestaande database (phpMyAdmin → SQL):

```sql
ALTER TABLE activities
  MODIFY status ENUM('pending','confirmed','declined','auto_declined','cancelled','completed') NOT NULL DEFAULT 'pending',
  ADD COLUMN is_rolling TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN completed_at DATETIME NULL,
  ADD COLUMN completed_by CHAR(36) NULL,
  ADD COLUMN rollover_count INT NOT NULL DEFAULT 0,
  ADD COLUMN original_start_at DATETIME NULL;
```

De cron `cron/auto_escalate.php` schuift lopende, niet-afgeronde activiteiten
automatisch één dag door en logt dit als `rolled_over` in de audit-log.
