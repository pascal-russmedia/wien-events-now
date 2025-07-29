
-- Drop the existing policy that only allows viewing approved events
DROP POLICY IF EXISTS "Anyone can view approved events" ON public.events;

-- Create a new policy that allows viewing approved events publicly
CREATE POLICY "Anyone can view approved events" ON public.events
  FOR SELECT 
  USING (state = 'Approved');

-- Create a policy that allows viewing pending events for the person who created them
CREATE POLICY "Creators can view their pending events" ON public.events
  FOR SELECT 
  USING (state = 'Pending' AND added_by_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Create a policy that allows viewing any event if accessed via service role (for edit links)
CREATE POLICY "Service role can view all events" ON public.events
  FOR SELECT 
  TO service_role
  USING (true);
