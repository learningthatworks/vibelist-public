-- Add url field to products table
ALTER TABLE public.products
ADD COLUMN url text;

-- Add url field to product_submissions table
ALTER TABLE public.product_submissions
ADD COLUMN url text;