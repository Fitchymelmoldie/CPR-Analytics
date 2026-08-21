-- Restrict the browser-facing roles to the operations the dashboard actually uses.
-- RLS remains the authorization boundary; these grants are the Data API boundary.

REVOKE ALL ON TABLE public.companies,
  public.profiles,
  public.analytics_data,
  public.consultant_reviews,
  public.kpi_benchmarks,
  public.leaderboard_groups
FROM anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.analytics_data TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.consultant_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.kpi_benchmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leaderboard_groups TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view own company or all if admin" ON public.companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;

CREATE POLICY "Users can view own company or all if admin"
ON public.companies FOR SELECT TO authenticated
USING (
  (select private.is_admin())
  OR id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Admins can insert companies"
ON public.companies FOR INSERT TO authenticated
WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admins can update companies"
ON public.companies FOR UPDATE TO authenticated
USING ((select private.is_admin()))
WITH CHECK ((select private.is_admin()));

CREATE POLICY "Users can update own company"
ON public.companies FOR UPDATE TO authenticated
USING (id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid())))
WITH CHECK (id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid())));

CREATE POLICY "Admins can delete companies"
ON public.companies FOR DELETE TO authenticated
USING ((select private.is_admin()));

DROP POLICY IF EXISTS "Users can view own company analytics or all if admin" ON public.analytics_data;
DROP POLICY IF EXISTS "Admins can insert analytics data" ON public.analytics_data;
DROP POLICY IF EXISTS "Admins can update analytics data" ON public.analytics_data;
DROP POLICY IF EXISTS "Admins can delete analytics data" ON public.analytics_data;

CREATE POLICY "Users can view own company analytics or all if admin"
ON public.analytics_data FOR SELECT TO authenticated
USING (
  (select private.is_admin())
  OR company_id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Admins can insert analytics data"
ON public.analytics_data FOR INSERT TO authenticated
WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admins can update analytics data"
ON public.analytics_data FOR UPDATE TO authenticated
USING ((select private.is_admin()))
WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admins can delete analytics data"
ON public.analytics_data FOR DELETE TO authenticated
USING ((select private.is_admin()));

DROP POLICY IF EXISTS "Users can view own company reviews or all if admin" ON public.consultant_reviews;
DROP POLICY IF EXISTS "Admins can insert consultant reviews" ON public.consultant_reviews;
DROP POLICY IF EXISTS "Admins can update consultant reviews" ON public.consultant_reviews;

CREATE POLICY "Users can view own company reviews or all if admin"
ON public.consultant_reviews FOR SELECT TO authenticated
USING (
  (select private.is_admin())
  OR company_id = (SELECT company_id FROM public.profiles WHERE id = (select auth.uid()))
);

CREATE POLICY "Admins can insert consultant reviews"
ON public.consultant_reviews FOR INSERT TO authenticated
WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admins can update consultant reviews"
ON public.consultant_reviews FOR UPDATE TO authenticated
USING ((select private.is_admin()))
WITH CHECK ((select private.is_admin()));

DROP POLICY IF EXISTS "Users can view own leaderboard groups" ON public.leaderboard_groups;
DROP POLICY IF EXISTS "Users can insert own leaderboard groups" ON public.leaderboard_groups;
DROP POLICY IF EXISTS "Users can delete own leaderboard groups" ON public.leaderboard_groups;

CREATE POLICY "Users can view own leaderboard groups"
ON public.leaderboard_groups FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own leaderboard groups"
ON public.leaderboard_groups FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own leaderboard groups"
ON public.leaderboard_groups FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own leaderboard groups"
ON public.leaderboard_groups FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);
