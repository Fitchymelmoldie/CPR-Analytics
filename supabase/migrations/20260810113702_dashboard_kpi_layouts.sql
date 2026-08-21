-- Store each bodyshop's ordered dashboard card selection independently from
-- analytics data. A missing row means the application should use its default
-- KPI layout.
CREATE TABLE public.dashboard_kpi_layouts (
    company_id VARCHAR(50) PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
    visible_kpis TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT dashboard_kpi_layouts_card_limit
      CHECK (cardinality(visible_kpis) BETWEEN 0 AND 12),
    CONSTRAINT dashboard_kpi_layouts_no_null_titles
      CHECK (array_position(visible_kpis, NULL) IS NULL)
);

ALTER TABLE public.dashboard_kpi_layouts ENABLE ROW LEVEL SECURITY;

-- Keep the Data API surface intentionally narrow. Anonymous visitors cannot
-- access layouts, and authenticated users do not need delete privileges.
REVOKE ALL ON TABLE public.dashboard_kpi_layouts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.dashboard_kpi_layouts TO authenticated;

CREATE POLICY "Users can view accessible dashboard layouts"
ON public.dashboard_kpi_layouts FOR SELECT TO authenticated
USING (
    company_id = (
      SELECT profiles.company_id
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
    ) OR (SELECT private.is_admin())
);

CREATE POLICY "Users can insert accessible dashboard layouts"
ON public.dashboard_kpi_layouts FOR INSERT TO authenticated
WITH CHECK (
    company_id = (
      SELECT profiles.company_id
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
    ) OR (SELECT private.is_admin())
);

CREATE POLICY "Users can update accessible dashboard layouts"
ON public.dashboard_kpi_layouts FOR UPDATE TO authenticated
USING (
    company_id = (
      SELECT profiles.company_id
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
    ) OR (SELECT private.is_admin())
)
WITH CHECK (
    company_id = (
      SELECT profiles.company_id
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
    ) OR (SELECT private.is_admin())
);
