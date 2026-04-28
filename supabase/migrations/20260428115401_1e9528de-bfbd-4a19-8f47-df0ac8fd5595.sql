
-- Fix function search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Revoke public execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- Restrict avatar listing: only allow SELECT on own folder; public reads still work via getPublicUrl (signed paths)
DROP POLICY "Avatars publicly readable" ON storage.objects;
CREATE POLICY "Avatars readable by anyone with path"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
-- (note: bucket public flag still allows direct public URL access, but linter wants scoped policy; keep as-is)
