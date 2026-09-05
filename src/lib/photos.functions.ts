import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const BUCKET = "activity-photos";

async function assertAccess(supabase: any, activityId: string) {
  const { data, error } = await supabase.rpc("can_access_activity", { _activity_id: activityId });
  if (error || !data) throw new Error("Geen toegang tot deze activiteit");
}

/** Foto's van een activiteit, met tijdelijke kijk-URL's. */
export const listActivityPhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ activity_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await assertAccess(supabase, data.activity_id);
    const { data: rows, error } = await supabase
      .from("activity_photos")
      .select("*")
      .eq("activity_id", data.activity_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const out: any[] = [];
    for (const r of rows ?? []) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(r.storage_path, 3600);
      out.push({ ...r, url: signed?.signedUrl ?? null });
    }
    return out;
  });

/** Signed upload-URL zodat de browser het bestand direct kan uploaden. */
export const createPhotoUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        activity_id: z.string().uuid(),
        filename: z.string().min(1).max(120),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    await assertAccess(supabase, data.activity_id);
    const ext = (data.filename.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeExt = ["jpg", "jpeg", "png", "webp", "heic", "heif", "gif"].includes(ext) ? ext : "jpg";
    const path = `${data.activity_id}/${crypto.randomUUID()}.${safeExt}`;
    const { data: signed, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

/** Registreer een geüploade foto in de database. */
export const registerActivityPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        activity_id: z.string().uuid(),
        storage_path: z.string().min(1),
        caption: z.string().max(300).nullable().optional(),
        lat: z.number().min(-90).max(90).nullable().optional(),
        lng: z.number().min(-180).max(180).nullable().optional(),
        taken_at: z.string().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAccess(supabase, data.activity_id);
    if (!data.storage_path.startsWith(`${data.activity_id}/`)) {
      throw new Error("Ongeldig bestandspad");
    }
    const { data: row, error } = await supabase
      .from("activity_photos")
      .insert({
        activity_id: data.activity_id,
        storage_path: data.storage_path,
        caption: data.caption ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        taken_at: data.taken_at ?? new Date().toISOString(),
        uploaded_by: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteActivityPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ photo_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: photo } = await supabase
      .from("activity_photos")
      .select("*")
      .eq("id", data.photo_id)
      .maybeSingle();
    if (!photo) throw new Error("Foto niet gevonden");
    const { error } = await supabase.from("activity_photos").delete().eq("id", data.photo_id);
    if (error) throw new Error(error.message);
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
    return { ok: true };
  });
