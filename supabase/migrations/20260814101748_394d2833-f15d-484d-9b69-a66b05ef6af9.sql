ALTER TYPE public.activity_status ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'completed';
ALTER TYPE public.audit_action ADD VALUE IF NOT EXISTS 'rolled_over';

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS is_rolling boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rollover_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS original_start_at timestamptz;