-- Remove public read access from product_submissions table
-- This prevents unauthorized access to submitter emails and other PII

DROP POLICY IF EXISTS "Public can read submissions" ON public.product_submissions;

-- The table will still have these policies:
-- - "Block direct client inserts" (INSERT with false check)
-- - "Only admins can update submissions" (UPDATE for service_role only)
-- - "Only admins can delete submissions" (DELETE for service_role only)

-- This means:
-- ✅ Public can no longer read any submissions (PII protected)
-- ✅ Edge function can still insert via service_role
-- ✅ You can still read/update via Supabase Dashboard (service_role)
-- ✅ Admin page will show nothing until authentication is implemented