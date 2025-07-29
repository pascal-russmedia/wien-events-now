-- Fix ordering to handle NULL popularity scores correctly
CREATE OR REPLACE FUNCTION public.get_expanded_future_events(
  region_filter text DEFAULT 'Vorarlberg',
  category_filter text DEFAULT NULL,
  subcategory_filter text DEFAULT NULL,
  start_date_filter date DEFAULT NULL,
  end_date_filter date DEFAULT NULL,
  single_date_filter date DEFAULT NULL,
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id text,
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
  event_date date,
  start_time text,
  end_time text,
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
  today_date date := CURRENT_DATE;
  where_conditions text := '';
  date_conditions text := '';
  full_query text;
BEGIN
  -- Base conditions
  where_conditions := 'e.state = ''Approved''';
  
  -- Region filtering
  IF region_filter IS NOT NULL AND region_filter != 'Vorarlberg' THEN
    where_conditions := where_conditions || ' AND (e.region = ''' || region_filter || ''' OR e.subregion = ''' || region_filter || ''')';
  ELSE
    where_conditions := where_conditions || ' AND e.region = ''Vorarlberg''';
  END IF;
  
  -- Category filtering
  IF category_filter IS NOT NULL THEN
    where_conditions := where_conditions || ' AND e.category = ''' || category_filter || '''';
  END IF;
  
  -- Subcategory filtering
  IF subcategory_filter IS NOT NULL THEN
    where_conditions := where_conditions || ' AND e.subcategory = ''' || subcategory_filter || '''';
  END IF;
  
  -- Date filtering for expanded dates
  date_conditions := '(d.value->>''date'')::date >= ''' || today_date || '''';
  
  -- Apply date range or single date filters
  IF single_date_filter IS NOT NULL THEN
    date_conditions := date_conditions || ' AND (d.value->>''date'')::date = ''' || single_date_filter || '''';
  ELSIF start_date_filter IS NOT NULL AND end_date_filter IS NOT NULL THEN
    date_conditions := date_conditions || ' AND (d.value->>''date'')::date >= ''' || start_date_filter || ''' AND (d.value->>''date'')::date <= ''' || end_date_filter || '''';
  END IF;
  
  -- Build the full query with expansion and filtering
  full_query := '
    WITH expanded_events AS (
      SELECT 
        e.id::text || ''-'' || (d.value->>''date'') as id,
        e.name,
        e.category,
        e.subcategory,
        e.description,
        e.region,
        e.subregion,
        e.host,
        e.address,
        e.state,
        e.popularity_score,
        e.trust_score,
        (d.value->>''date'')::date as event_date,
        COALESCE(d.value->>''startTime'', '''') as start_time,
        COALESCE(d.value->>''endTime'', '''') as end_time,
        e.image,
        e.price_type,
        e.price_amount,
        e.link,
        e.featured,
        e.added_by,
        e.added_by_email,
        e.created_at,
        e.updated_at
      FROM events e
      CROSS JOIN jsonb_array_elements(e.dates) as d
      WHERE ' || where_conditions || ' AND ' || date_conditions || '
    ),
    counted_events AS (
      SELECT *, COUNT(*) OVER() as total_count
      FROM expanded_events
      ORDER BY event_date ASC, COALESCE(popularity_score, 0) DESC
      LIMIT ' || limit_count || ' OFFSET ' || offset_count || '
    )
    SELECT * FROM counted_events';
    
  RETURN QUERY EXECUTE full_query;
END;
$$;