# App-versie hosten op cPanel met Node.js

De app-versie (React + TanStack Start) draait als Node-server. Dat kan op cPanel
via **Setup Node.js App**, als je hosting Node 18 of 20 aanbiedt en SSH/Terminal
toestaat. Werkt dat niet, gebruik dan de PHP-versie (`php/INSTALL_CPANEL.md`) of
publiceer de app rechtstreeks via Lovable (knop Publish).

## 1. Vereisten

- Node.js 18.20+ of 20.x in cPanel (10.x en 12.x werken niet)
- SSH- of Terminal-toegang (voor `npm install` en de build)
- Minstens ~1 GB vrij geheugen tijdens de build
- HTTPS (AutoSSL) op het domein of subdomein

## 2. Bestanden uploaden

1. Download de codebase (Code Editor → Download codebase, of via Git).
2. Upload/pak uit in bv. `/home/USER/planning-app/` (buiten `public_html`).

## 3. Node-app aanmaken in cPanel

Ga naar **Software → Setup Node.js App → Create Application**:

- **Node.js version**: 20.x (of 18.x)
- **Application mode**: Production
- **Application root**: `planning-app`
- **Application URL**: je (sub)domein
- **Application startup file**: `app.cjs`

Klik **Create**. Laat de app daarna voorlopig gestopt.

## 4. Omgevingsvariabelen

Voeg in hetzelfde scherm onder **Environment variables** toe:

| Naam | Waarde |
| --- | --- |
| `NODE_ENV` | `production` |
| `VITE_SUPABASE_URL` | uit je `.env` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | uit je `.env` |
| `VITE_SUPABASE_PROJECT_ID` | uit je `.env` |

Belangrijk: deze `VITE_`-waarden worden **tijdens de build** ingebakken. Zorg dat
ze ook in `.env` in de projectmap staan vóór je stap 5 uitvoert.

## 5. Installeren en bouwen (via Terminal/SSH)

cPanel toont bij de app een commando zoals
`source /home/USER/nodevenv/planning-app/20/bin/activate && cd /home/USER/planning-app`.
Voer dat eerst uit, daarna:

```bash
npm install
npm run build:node
```

De build maakt de map `dist-node/` met `server/index.mjs` en `public/`.
Duurt enkele minuten. Bij een out-of-memory-fout: bouw lokaal op je pc met
`npm run build:node` en upload alleen `dist-node/`, `app.cjs`, `package.json`.

## 6. Starten

Klik in cPanel op **Restart** bij de app. Open je domein: je krijgt de
loginpagina van de planning.

## 7. Bij problemen

- **502 / Application error**: check het log via cPanel → Setup Node.js App →
  log-bestand, of `stderr.log` in de app-root.
- **Witte pagina, geen data**: `VITE_`-variabelen ontbraken tijdens de build →
  `.env` aanvullen en opnieuw `npm run build:node` + Restart.
- **Passenger start niet**: controleer dat `app.cjs` als startup file staat en
  dat `dist-node/server/index.mjs` bestaat.
- **Node 10/12 als enige optie**: dan is deze route niet mogelijk; gebruik de
  PHP-versie.

## 8. Updates

Na elke wijziging in de code:

```bash
npm install
npm run build:node
```

en daarna **Restart** in cPanel.

## Let op

- Deze app blijft de Lovable Cloud-database (Supabase) gebruiken; die draait niet
  op je cPanel-server. Wil je volledig zelf hosten met eigen MySQL, gebruik de
  PHP-versie.
- Automatische escalatie/doorschuiven gebeurt via de ingestelde cron in de cloud;
  op cPanel kun je die endpoint ook met een cronjob aanroepen.
