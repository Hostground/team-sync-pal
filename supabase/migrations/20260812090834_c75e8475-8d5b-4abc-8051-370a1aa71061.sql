CREATE TABLE public.display_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  show_clock boolean NOT NULL DEFAULT true,
  clock_position text NOT NULL DEFAULT 'top-right',
  default_slide_seconds integer NOT NULL DEFAULT 10,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.display_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.display_templates(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'text',
  position integer NOT NULL DEFAULT 0,
  title text,
  body text,
  media jsonb NOT NULL DEFAULT '[]'::jsonb,
  seconds integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.displays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  template_id uuid REFERENCES public.display_templates(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  timezone text NOT NULL DEFAULT 'Europe/Brussels',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX display_slides_template_idx ON public.display_slides(template_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.display_templates TO authenticated;
GRANT ALL ON public.display_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.display_slides TO authenticated;
GRANT ALL ON public.display_slides TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.displays TO authenticated;
GRANT ALL ON public.displays TO service_role;

ALTER TABLE public.display_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.displays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage display templates" ON public.display_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'));

CREATE POLICY "Staff manage display slides" ON public.display_slides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'));

CREATE POLICY "Staff manage displays" ON public.displays FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'));

CREATE TRIGGER display_templates_updated_at BEFORE UPDATE ON public.display_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER display_slides_updated_at BEFORE UPDATE ON public.display_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER displays_updated_at BEFORE UPDATE ON public.displays
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Staff read display media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'display-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management')));
CREATE POLICY "Staff upload display media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'display-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management')));
CREATE POLICY "Staff update display media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'display-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management')));
CREATE POLICY "Staff delete display media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'display-media' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management')));