-- Drop all current RLS policies to start fresh
DROP POLICY IF EXISTS "Allow anonymous event submissions" ON public.events;
DROP POLICY IF EXISTS "Anyone can view approved events" ON public.events;
DROP POLICY IF EXISTS "External users can view own events" ON public.events;
DROP POLICY IF EXISTS "External users can update own events" ON public.events;
DROP POLICY IF EXISTS "Admin users can view all events" ON public.events;
DROP POLICY IF EXISTS "Admin users can update all events" ON public.events;
DROP POLICY IF EXISTS "Admin users can delete events" ON public.events;
DROP POLICY IF EXISTS "Service role can view all events" ON public.events;

-- Restore the original working policies from before today
CREATE POLICY "Anyone can view approved events" ON public.events
  FOR SELECT 
  USING (state = 'Approved');

CREATE POLICY "Allow anonymous event submissions" ON public.events
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "External users can view own events" ON public.events
  FOR SELECT 
  USING (added_by_email = ((current_setting('request.headers'::text, true))::json ->> 'x-user-email'::text));

CREATE POLICY "External users can update own events" ON public.events
  FOR UPDATE 
  USING (added_by_email = ((current_setting('request.headers'::text, true))::json ->> 'x-user-email'::text))
  WITH CHECK (added_by_email = ((current_setting('request.headers'::text, true))::json ->> 'x-user-email'::text));

CREATE POLICY "Admin users can view all events" ON public.events
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can update all events" ON public.events
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete events" ON public.events
  FOR DELETE 
  TO authenticated
  USING (true);

CREATE POLICY "Service role can view all events" ON public.events
  FOR SELECT 
  USING (true);