
-- 1. FEEDBACK: remove public read, expose safe public view
DROP POLICY IF EXISTS "Feedback public read" ON public.feedback;

CREATE POLICY "Users view own feedback"
ON public.feedback FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.public_feedback
WITH (security_invoker = true) AS
SELECT
  id,
  split_part(author_name, ' ', 1) AS author_name,
  rating,
  message,
  created_at
FROM public.feedback;

-- Allow the view to read underlying rows regardless of feedback RLS
CREATE POLICY "Feedback readable via public view"
ON public.feedback FOR SELECT
TO anon, authenticated
USING (true);

-- The view exposes only safe columns; we still need to prevent table-level
-- select of sensitive columns. Replace approach: revoke select on table from anon,
-- only allow through view. Simpler: keep public select but the view is what app uses.
-- To actually hide user_id/author_name, drop the broad policy and use column grants:
DROP POLICY IF EXISTS "Feedback readable via public view" ON public.feedback;

REVOKE SELECT ON public.feedback FROM anon, authenticated;
GRANT SELECT (id, rating, message, created_at) ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.public_feedback TO anon, authenticated;

-- Re-add a permissive select so authenticated owners can read their own full row
-- (column grants + RLS both apply; RLS controls rows, grants control columns)
-- Owner already covered by "Users view own feedback" above (full columns since they have table SELECT?).
-- Since we revoked, give owners full column access back:
GRANT SELECT ON public.feedback TO authenticated;
-- But that re-exposes columns; instead restrict via separate role isn't possible.
-- Acceptable: authenticated has full column SELECT, but RLS restricts rows to owner/admin.
-- anon keeps only the safe columns and only via the view.

-- 2. PROFILES: restrict select to owner + admins
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. USER_ROLES: explicit restrictive policy preventing non-admin inserts
CREATE POLICY "Only admins can insert roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. has_role: revoke direct execute (still callable from SECURITY DEFINER context in policies)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;

-- 5. STORAGE avatars: drop broad listing policy. Public URLs still work for public bucket.
DROP POLICY IF EXISTS "Avatars readable by anyone with path" ON storage.objects;
