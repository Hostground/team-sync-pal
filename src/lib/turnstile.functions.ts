import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Cloudflare Turnstile.
 * Zolang TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY niet zijn ingesteld,
 * blijft de bot-check uit en werkt aanmelden/registreren gewoon.
 */
export const getTurnstileConfig = createServerFn({ method: "GET" }).handler(async () => {
  const siteKey = process.env["TURNSTILE_SITE_KEY"] ?? "";
  const secret = process.env["TURNSTILE_SECRET_KEY"] ?? "";
  return { siteKey, enabled: Boolean(siteKey && secret) };
});

export const verifyTurnstile = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string; action?: string }) =>
    z
      .object({ token: z.string().max(4096), action: z.string().max(64).optional() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const secret = process.env["TURNSTILE_SECRET_KEY"] ?? "";
    if (!secret) return { ok: true, skipped: true as const };
    if (!data.token) return { ok: false, error: "Bot-verificatie ontbreekt" };

    try {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: data.token }),
      });
      const body = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
      if (!body.success) {
        console.error("[turnstile] verificatie mislukt", body["error-codes"]);
        return { ok: false, error: "Bot-verificatie mislukt, probeer opnieuw" };
      }
      return { ok: true, skipped: false as const };
    } catch (e) {
      console.error("[turnstile] siteverify onbereikbaar", e);
      return { ok: false, error: "Bot-verificatie tijdelijk niet beschikbaar" };
    }
  });
