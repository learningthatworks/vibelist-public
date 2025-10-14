-- Add use_case_category column to products table
ALTER TABLE public.products 
ADD COLUMN use_case_category text;

-- Add use_case_category to product_submissions table as well
ALTER TABLE public.product_submissions 
ADD COLUMN use_case_category text;

-- Update existing products with their use case categories based on the categorization
UPDATE public.products SET use_case_category = 'Mobile & Web App Builders' 
WHERE slug IN ('lovable', 'webdraw', 'build-with-mocha', 'stitch', 'vibecodeapp', 'canva-code', 'factoryai', 'wrapifai', 'codot', 'genspark-ai', 'a0-dev', 'createwithbloom', 'rork');

UPDATE public.products SET use_case_category = 'Game Development & Creative Tools' 
WHERE slug IN ('gambo-ai', 'rosebud-ai', 'anima', 'figma-make', 'grok-studio', 'tempo-labs');

UPDATE public.products SET use_case_category = 'Enterprise & Backend Builders' 
WHERE slug IN ('heybossai', 'clark', 'marsx', 'devin', 'github-copilot', 'codemender', 'allhands-ai', 'github-spark', 'replit-ai', 'vercel-v0', 'bolt');

UPDATE public.products SET use_case_category = 'IDE Plugins & Developer Agents' 
WHERE slug IN ('cursor', 'zed', 'warp', 'claude-code', 'imbue-sculptor', 'kiro', 'continuedev', 'cline', 'aider', 'pear-ai', 'tabnine', 'jetbrains-ai', 'augmentcode', 'haystack', 'chatgpt-code-canvas', 'roo-code');

UPDATE public.products SET use_case_category = 'Multi-Agent & Infrastructure Tools' 
WHERE slug IN ('cosineai', 'qoder', 'qodo', 'windsurf', 'databutton', 'create-xyz', 'google-opal', 'amazon-codewhisperer', 'neon-console', 'supabase');

-- Add index for faster filtering
CREATE INDEX idx_products_use_case_category ON public.products(use_case_category);