// Extra build config for self-hosting on a plain Node.js server (e.g. cPanel Node.js / Passenger).
// Usage: bunx vite build --config vite.config.node.ts  (or: npx vite build --config vite.config.node.ts)
// The default vite.config.ts stays untouched so Lovable's own publish flow keeps working.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node_server",
    output: { dir: "dist-node" },
  },
});
