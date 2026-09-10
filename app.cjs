/**
 * Startbestand voor cPanel Node.js (Phusion Passenger).
 * Zet dit bestand als "Application startup file" in de cPanel Node.js-app.
 *
 * Bouw eerst de Node-versie:  npm run build:node
 * Dat maakt de map dist-node/ met server/index.mjs + public/.
 */
const path = require("path");
const fs = require("fs");

const entry = path.join(__dirname, "dist-node", "server", "index.mjs");

if (!fs.existsSync(entry)) {
  console.error(
    "[start] dist-node/server/index.mjs ontbreekt. Voer eerst 'npm run build:node' uit.",
  );
  process.exit(1);
}

// Nitro node-server leest PORT / HOST uit de omgeving.
// Passenger geeft zelf een poort of socket door via PORT.
process.env.NODE_ENV = process.env.NODE_ENV || "production";

import(require("url").pathToFileURL(entry).href).catch((err) => {
  console.error("[start] kon de server niet starten:", err);
  process.exit(1);
});
