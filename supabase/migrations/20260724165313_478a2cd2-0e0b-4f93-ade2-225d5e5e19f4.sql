
CREATE TYPE public.audit_action AS ENUM ('confirmed','declined','auto_declined','cancelled','rescheduled');

CREATE TABLE public.activity_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action public.audit_action NOT NULL,
  note TEXT,
  previous_status public.activity_status,
  new_status public.activity_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activity_audit_log_activity_idx ON public.activity_audit_log(activity_id, created_at DESC);

GRANT SELECT ON public.activity_audit_log TO authenticated;
GRANT ALL ON public.activity_audit_log TO service_role;

ALTER TABLE public.activity_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff or involved parties can view audit"
ON public.activity_audit_log
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'management')
  OR actor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.activities a
    WHERE a.id = activity_audit_log.activity_id
      AND (a.assignee_id = auth.uid() OR a.created_by = auth.uid())
  )
);
