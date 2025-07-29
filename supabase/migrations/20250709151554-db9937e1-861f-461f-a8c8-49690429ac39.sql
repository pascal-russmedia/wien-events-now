-- Fix the get_export_events function to prevent duplicates and use better SQL practices
CREATE OR REPLACE FUNCTION public.get_export_events(
  search_date date,
  region_filter text DEFAULT NULL,
  category_filter text DEFAULT NULL,
  subcategory_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  subcategory text,
  description text,
  region text,
  subregion text,
  host text,
  address text,
  state text,
  popularity_score integer,
  trust_score integer,
  dates jsonb,
  image text,
  price_type text,
  price_amount numeric,
  link text,
  featured boolean,
  added_by text,
  added_by_email text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
    e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
    e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
    e.added_by_email, e.created_at, e.updated_at
  FROM events e
  WHERE e.state = 'Approved'
    AND EXISTS (
      SELECT 1 FROM jsonb_array_elements(e.dates) AS d 
      WHERE (d.value->>'date')::date = search_date
    )
    AND (region_filter IS NULL OR region_filter = 'all' OR e.region = region_filter OR e.subregion = region_filter)
    AND (category_filter IS NULL OR category_filter = 'all' OR e.category = category_filter)
    AND (subcategory_filter IS NULL OR subcategory_filter = 'all' OR e.subcategory = subcategory_filter)
  ORDER BY COALESCE(e.popularity_score, 0) DESC, e.created_at DESC;
END;
$$;