-- Update function to limit events per day for better performance
CREATE OR REPLACE FUNCTION public.get_home_page_events(
  region_filter text DEFAULT 'Vorarlberg'
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
DECLARE
  today_date date := CURRENT_DATE;
  end_date date := CURRENT_DATE + INTERVAL '7 days';
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
  
  -- Date filtering for next 7 days
  date_conditions := '(d.value->>''date'')::date >= ''' || today_date || ''' AND (d.value->>''date'')::date <= ''' || end_date || '''';
  
  -- Build the full query with expansion, filtering, and per-day limit
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
        e.created_at,
        e.updated_at,
        ROW_NUMBER() OVER (
          PARTITION BY (d.value->>''date'')::date 
          ORDER BY COALESCE(e.popularity_score, 0) DESC, e.created_at DESC
        ) as day_rank
      FROM events e
      CROSS JOIN jsonb_array_elements(e.dates) as d
      WHERE ' || where_conditions || ' AND ' || date_conditions || '
    )
    SELECT 
      id, name, category, subcategory, description, region, subregion, host, address, state,
      popularity_score, trust_score, event_date, start_time, end_time, image, price_type, 
      price_amount, link, featured, added_by, created_at, updated_at
    FROM expanded_events
    WHERE day_rank <= 12
    ORDER BY event_date ASC, COALESCE(popularity_score, 0) DESC, created_at DESC';
    
  RETURN QUERY EXECUTE full_query;
END;
$$;