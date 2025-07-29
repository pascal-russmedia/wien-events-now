-- Add city column to events table
ALTER TABLE public.events 
ADD COLUMN city text;