-- Fix Cline: Should be "IDE Plugins & Developer Agents" not "Development"
UPDATE public.products SET use_case_category = 'IDE Plugins & Developer Agents' WHERE slug = 'cline';

-- Fix Anima: Design/Figma tool, not game development
UPDATE public.products SET use_case_category = 'Prototyping' WHERE slug = 'anima';

-- Fix Figma Make: Design tool, not game development
UPDATE public.products SET use_case_category = 'Prototyping' WHERE slug = 'figma-make';

-- Fix CodeRabbit: Code review tool, should be IDE/Developer category
UPDATE public.products SET use_case_category = 'IDE Plugins & Developer Agents' WHERE slug = 'coderabbit';

-- Fix DevinAI: AI developer agent
UPDATE public.products SET use_case_category = 'IDE Plugins & Developer Agents' WHERE slug = 'devinai';

-- Fix StackBlitz Bolt: Full-stack web app builder
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug = 'stackblitz-bolt';

-- Fix Windsurf: IDE/coding agent, not infrastructure
UPDATE public.products SET use_case_category = 'IDE Plugins & Developer Agents' WHERE slug = 'windsurf';

-- Fix Qoder: IDE, not infrastructure
UPDATE public.products SET use_case_category = 'IDE Plugins & Developer Agents' WHERE slug = 'qoder';

-- Fix MarsX: Full-stack SaaS builder, not just enterprise backend
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug = 'marsx';

-- Fix Replit AI: Full-stack apps, not just backend
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug = 'replit-ai';

-- Fix Lovable: Full-stack apps, more than just mobile/web
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug = 'lovable';

-- Fix duplicate Tempo entry with null use_case_category
UPDATE public.products SET use_case_category = 'Prototyping' WHERE slug = 'tempo' AND use_case_category IS NULL;

-- Add missing use_case_category for other apps
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug = 'bubble' AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug = 'framer' AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Mobile & Web App Builders' WHERE slug = 'flutterflow' AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Mobile & Web App Builders' WHERE slug = 'draftbit' AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Mobile & Web App Builders' WHERE slug = 'bravo-studio' AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Enterprise & Backend Builders' WHERE slug IN ('appsmith', 'budibase', 'retool', 'tooljet', 'superblocks') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Enterprise & Backend Builders' WHERE slug IN ('8base', 'backendless', 'encore', 'hasura', 'nhost') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Enterprise & Backend Builders' WHERE slug IN ('directus', 'forest-admin', 'basedash', 'jet-admin') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug IN ('bildr', 'weweb', 'softr', 'pory', 'wappler') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug IN ('xano', 'supabase', 'glide', 'airtable', 'notion') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Multi-Agent & Infrastructure Tools' WHERE slug IN ('dify', 'flowise', 'langflow', 'node-red') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Prototyping' WHERE slug IN ('vercel-v0', 'plasmic', 'teleporthq', 'webstudio') AND use_case_category IS NULL;
UPDATE public.products SET use_case_category = 'Full-Stack Apps' WHERE slug IN ('create-xyz', 'created-app', 'blink', 'wrapifai') AND use_case_category IS NULL;