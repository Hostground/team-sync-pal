ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

CREATE TABLE public.activity_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  lat double precision,
  lng double precision,
  taken_at timestamptz,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_photos_activity ON public.activity_photos(activity_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_photos TO authenticated;
GRANT ALL ON public.activity_photos TO service_role;

ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_select" ON public.activity_photos
  FOR SELECT TO authenticated
  USING (public.can_access_activity(activity_id));

CREATE POLICY "photos_insert" ON public.activity_photos
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND public.can_access_activity(activity_id));

CREATE POLICY "photos_update" ON public.activity_photos
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'))
  WITH CHECK (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'));

CREATE POLICY "photos_delete" ON public.activity_photos
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'));

CREATE POLICY "activity_photos_storage_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'activity-photos' AND public.can_access_activity(((storage.foldername(name))[1])::uuid));

CREATE POLICY "activity_photos_storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'activity-photos' AND public.can_access_activity(((storage.foldername(name))[1])::uuid));

CREATE POLICY "activity_photos_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'activity-photos' AND public.can_access_activity(((storage.foldername(name))[1])::uuid));