
-- First, let's check if we need to create the SELECT policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Authenticated users can view all events'
    ) THEN
        CREATE POLICY "Authenticated users can view all events" ON public.events
          FOR SELECT 
          TO authenticated 
          USING (true);
    END IF;
END
$$;

-- The UPDATE policy already exists based on the error, so we'll skip it

-- Check if we need to create the DELETE policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'Authenticated users can delete events'
    ) THEN
        CREATE POLICY "Authenticated users can delete events" ON public.events
          FOR DELETE 
          TO authenticated 
          USING (true);
    END IF;
END
$$;
