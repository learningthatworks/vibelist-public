-- Ensure products.id autoincrements using a sequence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'S' AND c.relname = 'products_id_seq' AND n.nspname = 'public'
  ) THEN
    CREATE SEQUENCE public.products_id_seq;
  END IF;
END$$;

-- Set sequence ownership and default on products.id
ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
ALTER TABLE public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);

-- Align the sequence with current max(id)
SELECT setval('public.products_id_seq', COALESCE((SELECT MAX(id) FROM public.products), 0));