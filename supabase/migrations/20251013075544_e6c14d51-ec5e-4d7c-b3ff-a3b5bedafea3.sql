-- Fix comma-separated tags to use semicolons instead
-- Replace ", " with ";" for consistency

UPDATE public.products 
SET tags = REPLACE(tags, ', ', ';')
WHERE tags LIKE '%,%' AND tags NOT LIKE '%;%';

-- Also handle cases where there might be just commas without spaces
UPDATE public.products 
SET tags = REPLACE(tags, ',', ';')
WHERE tags LIKE '%,%' AND tags NOT LIKE '%;%';