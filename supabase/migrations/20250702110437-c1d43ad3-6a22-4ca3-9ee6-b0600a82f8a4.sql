-- Make trust_score field nullable in events table
ALTER TABLE public.events ALTER COLUMN trust_score DROP NOT NULL;