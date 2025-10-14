-- Remove the public insert policy that allows anyone to insert directly
DROP POLICY IF EXISTS "Anyone can submit products" ON public.product_submissions;

-- Create a new policy that blocks all direct client inserts
-- The edge function uses service_role which bypasses RLS, so it can still insert
CREATE POLICY "Block direct client inserts" 
ON public.product_submissions 
FOR INSERT 
WITH CHECK (false);

-- Add a comment explaining the security model
COMMENT ON POLICY "Block direct client inserts" ON public.product_submissions IS 
'Blocks direct client inserts. All submissions must go through the submit-product edge function which performs CAPTCHA verification, input validation, and rate limiting.';