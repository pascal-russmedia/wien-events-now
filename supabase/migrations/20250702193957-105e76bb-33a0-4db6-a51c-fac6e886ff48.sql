-- Add subcategory column to events table
ALTER TABLE public.events 
ADD COLUMN subcategory text;