-- Keep equivalent authorization in one policy per action, and index the
-- foreign keys used by company/user-scoped queries.

DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;

CREATE POLICY "Users and admins can update companies"
ON public.companies FOR UPDATE TO authenticated
USING (
  (select private.is_admin())
  OR id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid()))
)
WITH CHECK (
  (select private.is_admin())
  OR id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid()))
);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users and admins can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  (select private.is_admin())
  OR id = (select auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_profiles_company_id
  ON public.profiles (company_id);

CREATE INDEX IF NOT EXISTS idx_leaderboard_groups_user_id
  ON public.leaderboard_groups (user_id);
