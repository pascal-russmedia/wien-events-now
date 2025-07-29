-- Add missing INSERT policy for anonymous event submissions
CREATE POLICY "Allow anonymous event submissions" ON public.events
  FOR INSERT 
  TO anon
  WITH CHECK (true);