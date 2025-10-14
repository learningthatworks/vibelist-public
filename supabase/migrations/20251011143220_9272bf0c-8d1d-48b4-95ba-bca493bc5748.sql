-- Add unique constraint to prevent duplicate votes
ALTER TABLE public.votes
ADD CONSTRAINT votes_product_anon_unique UNIQUE (product_id, anon_id);

-- Create function to update product ratings when votes change
CREATE OR REPLACE FUNCTION public.update_product_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the product's avg_rating and vote_count
  UPDATE public.products
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating)::numeric, 0)
      FROM public.votes
      WHERE product_id = NEW.product_id
    ),
    vote_count = (
      SELECT COUNT(*)::integer
      FROM public.votes
      WHERE product_id = NEW.product_id
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update ratings after vote insert
CREATE TRIGGER update_product_ratings_trigger
AFTER INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_product_ratings();