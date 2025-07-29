
-- Drop the existing insert policy for events
DROP POLICY IF EXISTS "Anyone can insert events" ON public.events;

-- Create a new policy that explicitly allows anonymous users to insert events
CREATE POLICY "Allow anonymous event submissions" ON public.events
  FOR INSERT 
  WITH CHECK (true);

-- Also ensure we have a policy for anonymous users to insert without authentication
CREATE POLICY "Enable insert for anonymous users" ON public.events
  FOR INSERT 
  TO anon 
  WITH CHECK (true);
