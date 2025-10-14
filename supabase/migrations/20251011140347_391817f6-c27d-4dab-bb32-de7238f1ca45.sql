-- Enable RLS on crawler tables (these were missing RLS policies)
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_results ENABLE ROW LEVEL SECURITY;

-- Add read-only policies for public access (crawler data should be readable)
CREATE POLICY "sources_read" ON public.sources FOR SELECT USING (true);
CREATE POLICY "crawl_queue_read" ON public.crawl_queue FOR SELECT USING (true);
CREATE POLICY "crawl_results_read" ON public.crawl_results FOR SELECT USING (true);

-- Only service role can write to crawler tables
CREATE POLICY "sources_service_write"
  ON public.sources FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "crawl_queue_service_write"
  ON public.crawl_queue FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "crawl_results_service_write"
  ON public.crawl_results FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Update function search paths for security
CREATE OR REPLACE FUNCTION public.increment_vote(p_tool text, p_vote_type text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF p_vote_type = 'up' THEN
    INSERT INTO public.votes (tool, up, down)
    VALUES (p_tool, 1, 0)
    ON CONFLICT (tool)
    DO UPDATE SET up = votes.up + 1;
  ELSIF p_vote_type = 'down' THEN
    INSERT INTO public.votes (tool, up, down)
    VALUES (p_tool, 0, 1)
    ON CONFLICT (tool)
    DO UPDATE SET down = votes.down + 1;
  END IF;
END;
$function$;