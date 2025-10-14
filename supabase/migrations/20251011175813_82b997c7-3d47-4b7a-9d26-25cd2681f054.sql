-- Drop and recreate the materialized view to include use_case_category
DROP MATERIALIZED VIEW IF EXISTS public.product_scores;

CREATE MATERIALIZED VIEW public.product_scores AS
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
  p.use_case_category,
  p.overview_short,
  p.pros_short,
  p.cons_short,
  p.complexity_hint,
  p.difficulty_hint,
  p.url,
  p.created_at,
  -- Weighted score calculation
  (
    COALESCE(p.avg_rating, 0) * 0.4 +
    LEAST(p.vote_count, 100) * 0.01 * 0.3 +
    CASE WHEN p.first_class_supabase THEN 0.1 ELSE 0 END +
    CASE WHEN p.first_class_neon THEN 0.1 ELSE 0 END +
    CASE WHEN p.oss THEN 0.05 ELSE 0 END +
    CASE WHEN p.enterprise_ready THEN 0.05 ELSE 0 END +
    3.0
  ) AS score
FROM public.products p;