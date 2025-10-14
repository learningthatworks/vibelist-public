-- Create table for public product submissions (pending admin approval)
CREATE TABLE public.product_submissions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  category_type text NOT NULL,
  db_fit text NOT NULL,
  deploy_path text,
  pricing_model text,
  oss boolean NOT NULL DEFAULT false,
  ai_builder boolean NOT NULL DEFAULT false,
  designer_first boolean NOT NULL DEFAULT false,
  enterprise_ready boolean NOT NULL DEFAULT false,
  first_class_neon boolean NOT NULL DEFAULT false,
  first_class_supabase boolean NOT NULL DEFAULT false,
  byo_postgres boolean NOT NULL DEFAULT true,
  tags text,
  overview_short text,
  pros_short text,
  cons_short text,
  complexity_hint smallint CHECK (complexity_hint >= 0 AND complexity_hint <= 5),
  difficulty_hint smallint CHECK (difficulty_hint >= 0 AND difficulty_hint <= 5),
  submitter_email text,
  submitter_notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by text
);

-- Enable RLS
ALTER TABLE public.product_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public submissions)
CREATE POLICY "Anyone can submit products"
ON public.product_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to read their own submissions (future: by email or session)
CREATE POLICY "Public can read submissions"
ON public.product_submissions
FOR SELECT
TO anon, authenticated
USING (true);

-- Only service role can update/delete (admin approval workflow)
CREATE POLICY "Only admins can update submissions"
ON public.product_submissions
FOR UPDATE
USING (auth.role() = 'service_role');

CREATE POLICY "Only admins can delete submissions"
ON public.product_submissions
FOR DELETE
USING (auth.role() = 'service_role');