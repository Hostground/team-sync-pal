import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CodeSchema = z.object({ code: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/) });

export type DisplayTheme = {
  bg?: string;
  accent?: string;
  text?: string;
  overlay?: number;
  textScale?: number;
};

export type DisplaySlide = {
  id: string;
  kind: "text" | "photos" | "planning_today";
  title: string | null;
  body: string | null;
  seconds: number;
  images: string[];
};

export type DisplayPayload = {
  name: string;
  timezone: string;
  show_clock: boolean;
  clock_position: string;
  theme: DisplayTheme;
  slides: DisplaySlide[];
  today: { start: string; end: string; title: string; location: string | null; person: string | null }[];
};

/**
 * Public endpoint for the lobby TV. Authenticated only by the display's secret code.
 * Returns display content plus a privacy-limited view of today's planning.
 */
export const getDisplayByCode = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => CodeSchema.parse(data))
  .handler(async ({ data }): Promise<DisplayPayload | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: display } = await supabaseAdmin
      .from("displays")
      .select("name, timezone, active, template_id")
      .eq("code", data.code)
      .maybeSingle();

    if (!display || !display.active) return null;

    type TemplateRow = {
      theme: DisplayTheme;
      show_clock: boolean;
      clock_position: string;
      default_slide_seconds: number;
    };
    let template: TemplateRow | null = null;
    let slideRows: {
      id: string;
      kind: string;
      title: string | null;
      body: string | null;
      media: unknown;
      seconds: number | null;
    }[] = [];

    if (display.template_id) {
      const { data: t } = await supabaseAdmin
        .from("display_templates")
        .select("theme, show_clock, clock_position, default_slide_seconds")
        .eq("id", display.template_id)
        .maybeSingle();
      template = (t as TemplateRow | null) ?? null;

      const { data: s } = await supabaseAdmin
        .from("display_slides")
        .select("id, kind, title, body, media, seconds")
        .eq("template_id", display.template_id)
        .eq("active", true)
        .order("position", { ascending: true });
      slideRows = s ?? [];
    }

    // Sign media paths so the TV can render them without a login.
    const allPaths = slideRows.flatMap((s) => (Array.isArray(s.media) ? (s.media as string[]) : []));
    const signed = new Map<string, string>();
    if (allPaths.length > 0) {
      const { data: urls } = await supabaseAdmin.storage
        .from("display-media")
        .createSignedUrls(allPaths, 60 * 60 * 6);
      for (const u of urls ?? []) {
        if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
      }
    }

    const defaultSeconds = template?.default_slide_seconds ?? 10;
    const slides: DisplaySlide[] = slideRows.map((s) => ({
      id: s.id,
      kind: (s.kind as DisplaySlide["kind"]) ?? "text",
      title: s.title,
      body: s.body,
      seconds: s.seconds && s.seconds > 0 ? s.seconds : defaultSeconds,
      images: (Array.isArray(s.media) ? (s.media as string[]) : [])
        .map((p) => (p.startsWith("http") ? p : signed.get(p)))
        .filter((u): u is string => !!u),
    }));

    // Today's planning (only if a slide needs it)
    let today: DisplayPayload["today"] = [];
    if (slides.some((s) => s.kind === "planning_today")) {
      const now = new Date();
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const { data: acts } = await supabaseAdmin
        .from("activities")
        .select("start_at, end_at, title, location, assignee_id, status")
        .gte("start_at", dayStart.toISOString())
        .lt("start_at", dayEnd.toISOString())
        .neq("status", "cancelled")
        .order("start_at", { ascending: true });

      const ids = [...new Set((acts ?? []).map((a) => a.assignee_id))];
      const names = new Map<string, string>();
      if (ids.length > 0) {
        const { data: profs } = await supabaseAdmin
          .from("profiles")
          .select("id, full_name")
          .in("id", ids);
        for (const p of profs ?? []) {
          // Only a first name reaches the public screen.
          const first = (p.full_name ?? "").trim().split(/\s+/)[0] ?? "";
          if (first) names.set(p.id, first);
        }
      }

      today = (acts ?? []).map((a) => ({
        start: a.start_at,
        end: a.end_at,
        title: a.title,
        location: a.location,
        person: names.get(a.assignee_id) ?? null,
      }));
    }

    return {
      name: display.name,
      timezone: display.timezone,
      show_clock: template?.show_clock ?? true,
      clock_position: template?.clock_position ?? "top-right",
      theme: template?.theme ?? {},
      slides,
      today,
    };
  });
