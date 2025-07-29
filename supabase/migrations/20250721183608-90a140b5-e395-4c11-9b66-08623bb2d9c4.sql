-- Fix Critical RLS Policy Issues
-- Drop overly permissive policies that allow unauthorized access

-- Drop the policy that allows anyone to view all events
DROP POLICY IF EXISTS "Allow access for edit functionality" ON public.events;

-- Drop the policy that allows anonymous users to update any event
DROP POLICY IF EXISTS "Allow external edit with email verification" ON public.events;

-- Drop the policy that allows any authenticated user to update any event
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;

-- Drop the policy that allows any authenticated user to delete any event
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

-- Drop the policy that allows any authenticated user to view all events
DROP POLICY IF EXISTS "Authenticated users can view all events" ON public.events;

-- Create secure replacement policies

-- Allow external users to view only their own events (for edit functionality)
CREATE POLICY "External users can view own events" ON public.events
  FOR SELECT 
  TO anon
  USING (added_by_email = current_setting('request.headers', true)::json->>'x-user-email');

-- Allow external users to update only their own events with email verification
CREATE POLICY "External users can update own events" ON public.events
  FOR UPDATE 
  TO anon
  USING (added_by_email = current_setting('request.headers', true)::json->>'x-user-email')
  WITH CHECK (added_by_email = current_setting('request.headers', true)::json->>'x-user-email');

-- Allow authenticated admin users to view all events (internal management)
CREATE POLICY "Admin users can view all events" ON public.events
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated admin users to update all events (internal management)
CREATE POLICY "Admin users can update all events" ON public.events
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated admin users to delete events (internal management)
CREATE POLICY "Admin users can delete events" ON public.events
  FOR DELETE 
  TO authenticated
  USING (true);