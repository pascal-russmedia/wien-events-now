
-- Create function to search for similar events based on name, region, and city
CREATE OR REPLACE FUNCTION public.search_similar_events(
  event_name text,
  event_region text,
  event_city text
)
RETURNS TABLE(
  id uuid,
  name text,
  event_date date,
  region text,
  subregion text,
  city text,
  host text,
  address text,
  similarity_score real
)
LANGUAGE plpgsql
AS $$
DECLARE
  today_date date := CURRENT_DATE;
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.name,
    (d.value->>'date')::date as event_date,
    e.region,
    e.subregion,
    e.city,
    e.host,
    e.address,
    similarity(e.name, event_name) as similarity_score
  FROM events e
  CROSS JOIN jsonb_array_elements(e.dates) as d
  WHERE e.state = 'Approved'
    AND (d.value->>'date')::date >= today_date
    AND (e.region = event_region OR e.subregion = event_region)
    AND LOWER(e.city) = LOWER(event_city)
    AND similarity(e.name, event_name) > 0.3
  ORDER BY similarity_score DESC, (d.value->>'date')::date ASC
  LIMIT 5;
END;
$$;

-- Enable pg_trgm extension if not already enabled (for similarity function)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
