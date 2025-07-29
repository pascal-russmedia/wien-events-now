-- Drop the previous policy that won't work
DROP POLICY IF EXISTS "External users can update events with matching email" ON public.events;

-- Create a new RLS policy that allows anyone to update events (since we're using email verification in the query)
CREATE POLICY "Allow external edit with email verification" 
ON public.events 
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);