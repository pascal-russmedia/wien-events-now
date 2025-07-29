-- Create a function specifically for export search
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
DECLARE
  where_conditions text := '';
  full_query text;
BEGIN
  -- Base conditions - only approved events
  where_conditions := 'e.state = ''Approved''';
  
  -- Must have the search date in the dates array
  where_conditions := where_conditions || ' AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>''date'')::date = ''' || search_date || '''
  )';
  
  -- Add region filter if provided
  IF region_filter IS NOT NULL AND region_filter != 'all' THEN
    where_conditions := where_conditions || ' AND (e.region = ''' || region_filter || ''' OR e.subregion = ''' || region_filter || ''')';
  END IF;
  
  -- Add category filter if provided
  IF category_filter IS NOT NULL AND category_filter != 'all' THEN
    where_conditions := where_conditions || ' AND e.category = ''' || category_filter || '''';
  END IF;
  
  -- Add subcategory filter if provided
  IF subcategory_filter IS NOT NULL AND subcategory_filter != 'all' THEN
    where_conditions := where_conditions || ' AND e.subcategory = ''' || subcategory_filter || '''';
  END IF;
  
  -- Build the full query
  full_query := '
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at
    FROM events e
    WHERE ' || where_conditions || '
    ORDER BY COALESCE(e.popularity_score, 0) DESC, e.created_at DESC';
    
  RETURN QUERY EXECUTE full_query;
END;
$$;