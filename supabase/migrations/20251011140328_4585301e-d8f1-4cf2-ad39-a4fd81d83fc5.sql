-- Note: Most tables already exist in the database. 
-- This migration only adds the materialized view and function to refresh it.

-- Create the ranking view with Bayesian scoring
CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_scores AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.category_type,
  p.db_fit,
  p.first_class_neon,
  p.first_class_supabase,
  p.byo_postgres,
  p.deploy_path,
  p.oss,
  p.pricing_model,
  p.ai_builder,
  p.designer_first,
  p.enterprise_ready,
  p.tags,
  p.avg_rating,
  p.vote_count,
  -- Bayesian score: prior = 3.5 with k=20 + engagement + bonuses - penalties
  (
    (p.vote_count * p.avg_rating + 20 * 3.5) / NULLIF(p.vote_count + 20, 0)
  ) 
  + LN(GREATEST(p.vote_count, 1)) * 0.15
  + (CASE WHEN p.first_class_supabase OR p.first_class_neon THEN 0.2 ELSE 0 END)
  - (COALESCE(p.difficulty_hint, 0) + COALESCE(p.complexity_hint, 0)) * 0.03
  AS score
FROM public.products p;

-- Create index on slug for the view
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_scores_id ON public.product_scores (id);
CREATE INDEX IF NOT EXISTS idx_product_scores_slug ON public.product_scores (slug);
CREATE INDEX IF NOT EXISTS idx_product_scores_score ON public.product_scores (score DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_product_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.product_scores;
END;
$$;