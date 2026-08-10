-- Helper: can current user access an activity's checklist
CREATE OR REPLACE FUNCTION public.can_access_activity(_activity_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.id = _activity_id
      AND (a.assignee_id = auth.uid()
           OR a.created_by = auth.uid()
           OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'management'))
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_activity(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_activity(uuid) TO authenticated;

-- Checklist items
CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  done_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  position integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checklist_items_scope CHECK (
    (activity_id IS NOT NULL AND owner_id IS NULL)
    OR (activity_id IS NULL AND owner_id IS NOT NULL)
  )
);

CREATE INDEX idx_checklist_items_activity ON public.checklist_items(activity_id, position);
CREATE INDEX idx_checklist_items_owner ON public.checklist_items(owner_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_items TO authenticated;
GRANT ALL ON public.checklist_items TO service_role;

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist items read" ON public.checklist_items
FOR SELECT TO authenticated
USING (
  (owner_id IS NOT NULL AND owner_id = auth.uid())
  OR (activity_id IS NOT NULL AND public.can_access_activity(activity_id))
);

CREATE POLICY "checklist items insert" ON public.checklist_items
FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    (owner_id IS NOT NULL AND owner_id = auth.uid())
    OR (activity_id IS NOT NULL AND public.can_access_activity(activity_id))
  )
);

CREATE POLICY "checklist items update" ON public.checklist_items
FOR UPDATE TO authenticated
USING (
  (owner_id IS NOT NULL AND owner_id = auth.uid())
  OR (activity_id IS NOT NULL AND public.can_access_activity(activity_id))
)
WITH CHECK (
  (owner_id IS NOT NULL AND owner_id = auth.uid())
  OR (activity_id IS NOT NULL AND public.can_access_activity(activity_id))
);

CREATE POLICY "checklist items delete" ON public.checklist_items
FOR DELETE TO authenticated
USING (
  (owner_id IS NOT NULL AND owner_id = auth.uid())
  OR (activity_id IS NOT NULL AND public.can_access_activity(activity_id))
);

CREATE TRIGGER trg_checklist_items_updated
BEFORE UPDATE ON public.checklist_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Templates
CREATE TABLE public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_templates TO authenticated;
GRANT ALL ON public.checklist_templates TO service_role;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist templates read" ON public.checklist_templates
FOR SELECT TO authenticated USING (true);

CREATE POLICY "checklist templates insert" ON public.checklist_templates
FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management')));

CREATE POLICY "checklist templates update" ON public.checklist_templates
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'));

CREATE POLICY "checklist templates delete" ON public.checklist_templates
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'));

CREATE TRIGGER trg_checklist_templates_updated
BEFORE UPDATE ON public.checklist_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.checklist_template_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  title text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_checklist_template_items ON public.checklist_template_items(template_id, position);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_template_items TO authenticated;
GRANT ALL ON public.checklist_template_items TO service_role;
ALTER TABLE public.checklist_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist template items read" ON public.checklist_template_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "checklist template items write" ON public.checklist_template_items
FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'management'));

-- Realtime
ALTER TABLE public.checklist_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_items;