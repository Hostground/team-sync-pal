REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_activity(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_activity(uuid) TO authenticated;