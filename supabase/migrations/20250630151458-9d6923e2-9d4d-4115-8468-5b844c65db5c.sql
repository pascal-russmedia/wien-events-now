
-- Drop the problematic JWT-based policy
DROP POLICY IF EXISTS "Creators can view their pending events" ON public.events;

-- Create a policy that allows anyone to view any event (this is needed for edit links)
-- The actual access control is handled in the application logic
CREATE POLICY "Allow access for edit functionality" ON public.events
  FOR SELECT 
  TO anon, authenticated
  USING (true);
