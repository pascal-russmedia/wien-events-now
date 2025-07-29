-- Create a function to help filter events by date logic
CREATE OR REPLACE FUNCTION public.get_events_by_date_filter(
  show_future_events boolean,
  state_filter text DEFAULT NULL,
  search_query text DEFAULT NULL,
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
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
  updated_at timestamp with time zone,
  total_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
  today_start date := CURRENT_DATE;
  where_conditions text := '';
  full_query text;
BEGIN
  -- Build date condition
  IF show_future_events THEN
    -- Future events: ANY date is >= today
    where_conditions := 'EXISTS (SELECT 1 FROM jsonb_array_elements(dates) AS d WHERE (d->''date'')::date >= ''' || today_start || ''')';
  ELSE
    -- Past events: ALL dates are < today  
    where_conditions := 'NOT EXISTS (SELECT 1 FROM jsonb_array_elements(dates) AS d WHERE (d->''date'')::date >= ''' || today_start || ''')';
  END IF;
  
  -- Add state filter
  IF state_filter IS NOT NULL AND state_filter != 'all' THEN
    where_conditions := where_conditions || ' AND state = ''' || state_filter || '''';
  END IF;
  
  -- Add search filter
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    where_conditions := where_conditions || ' AND name ILIKE ''%' || trim(search_query) || '%''';
  END IF;
  
  -- Build the full query
  full_query := '
    WITH filtered_events AS (
      SELECT *, COUNT(*) OVER() as total_count
      FROM events 
      WHERE ' || where_conditions || '
      ORDER BY created_at DESC
      LIMIT ' || limit_count || ' OFFSET ' || offset_count || '
    )
    SELECT * FROM filtered_events';
    
  RETURN QUERY EXECUTE full_query;
END;
$$;