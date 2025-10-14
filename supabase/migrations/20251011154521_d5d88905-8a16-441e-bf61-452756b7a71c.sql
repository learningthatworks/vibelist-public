-- Create trigger function to auto-refresh product_scores materialized view
CREATE OR REPLACE FUNCTION public.trigger_refresh_product_scores()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.refresh_product_scores();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on votes table to refresh scores when votes change
CREATE TRIGGER refresh_scores_on_vote
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_refresh_product_scores();

-- Create trigger on products table to refresh scores when products change
CREATE TRIGGER refresh_scores_on_product_change
AFTER INSERT OR UPDATE ON public.products
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_refresh_product_scores();