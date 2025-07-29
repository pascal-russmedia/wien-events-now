-- Create a new RLS policy to allow external users to update events if their email matches
CREATE POLICY "External users can update events with matching email" 
ON public.events 
FOR UPDATE 
USING (added_by_email = current_setting('request.headers')::json->>'x-user-email')
WITH CHECK (added_by_email = current_setting('request.headers')::json->>'x-user-email');