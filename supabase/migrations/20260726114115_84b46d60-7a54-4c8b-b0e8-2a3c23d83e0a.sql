
-- 1) Restrict settings SELECT to staff only
DROP POLICY IF EXISTS "settings read" ON public.settings;
CREATE POLICY "settings staff read" ON public.settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'management'));

-- 2) Convert security definer helpers to invoker (safe: policies only check auth.uid() self, and user_roles allows self-select)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid()
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'management' THEN 2 ELSE 3 END LIMIT 1;
$$;

-- 3) Cron secret table (service-role only, RLS on, no policies)
CREATE TABLE IF NOT EXISTS public.cron_config (
  id int PRIMARY KEY DEFAULT 1,
  cron_secret text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cron_config_single_row CHECK (id = 1)
);
REVOKE ALL ON public.cron_config FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.cron_config TO service_role;
ALTER TABLE public.cron_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.cron_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 4) Reschedule the cron job to send the new secret instead of the anon key
DO $$
DECLARE
  v_secret text;
  v_headers text;
BEGIN
  SELECT cron_secret INTO v_secret FROM public.cron_config WHERE id = 1;

  BEGIN
    PERFORM cron.unschedule('auto-escalate-overdue-activities');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  v_headers := jsonb_build_object(
    'content-type', 'application/json',
    'x-cron-secret', v_secret
  )::text;

  PERFORM cron.schedule(
    'auto-escalate-overdue-activities',
    '*/5 * * * *',
    format($cmd$
      SELECT net.http_post(
        url := 'https://team-sync-pal.lovable.app/api/public/hooks/auto-escalate',
        headers := %L::jsonb,
        body := '{}'::jsonb
      );
    $cmd$, v_headers)
  );
END $$;
