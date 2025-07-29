-- Fix type mismatch by casting count values to bigint
CREATE OR REPLACE FUNCTION public.get_internal_events_grouped(
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0,
  search_query text DEFAULT NULL
)
RETURNS TABLE(
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
  is_future boolean,
  future_pending_count bigint,
  future_approved_count bigint,
  future_rejected_count bigint,
  future_total_count bigint,
  past_pending_count bigint,
  past_approved_count bigint,
  past_rejected_count bigint,
  past_total_count bigint
)
LANGUAGE plpgsql
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  future_pending_cnt bigint := 0;
  future_approved_cnt bigint := 0;
  future_rejected_cnt bigint := 0;
  future_total_cnt bigint := 0;
  past_pending_cnt bigint := 0;
  past_approved_cnt bigint := 0;
  past_rejected_cnt bigint := 0;
  past_total_cnt bigint := 0;
  search_condition text := '';
BEGIN
  -- Build search condition
  IF search_query IS NOT NULL AND trim(search_query) != '' THEN
    search_condition := ' AND name ILIKE ''%' || trim(search_query) || '%''';
  END IF;

  -- Get counts for future events (events with at least one date >= today)
  EXECUTE 'SELECT 
    COALESCE(SUM(CASE WHEN e.state = ''Pending'' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = ''Approved'' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = ''Rejected'' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  FROM events e
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>''date'')::date >= ''' || today_date || '''
  )' || search_condition
  INTO future_pending_cnt, future_approved_cnt, future_rejected_cnt, future_total_cnt;

  -- Get counts for past events (events with NO dates >= today)
  EXECUTE 'SELECT 
    COALESCE(SUM(CASE WHEN e.state = ''Pending'' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = ''Approved'' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = ''Rejected'' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  FROM events e
  WHERE NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>''date'')::date >= ''' || today_date || '''
  )' || search_condition
  INTO past_pending_cnt, past_approved_cnt, past_rejected_cnt, past_total_cnt;

  -- Return paginated events with grouping information and counts
  RETURN QUERY
  EXECUTE 'SELECT 
    e.id,
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
    e.dates,
    e.image,
    e.price_type,
    e.price_amount,
    e.link,
    e.featured,
    e.added_by,
    e.added_by_email,
    e.created_at,
    e.updated_at,
    -- Determine if event is future (has at least one date >= today)
    EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(e.dates) AS d 
      WHERE (d.value->>''date'')::date >= ''' || today_date || '''
    ) as is_future,
    ' || future_pending_cnt || '::bigint as future_pending_count,
    ' || future_approved_cnt || '::bigint as future_approved_count,
    ' || future_rejected_cnt || '::bigint as future_rejected_count,
    ' || future_total_cnt || '::bigint as future_total_count,
    ' || past_pending_cnt || '::bigint as past_pending_count,
    ' || past_approved_cnt || '::bigint as past_approved_count,
    ' || past_rejected_cnt || '::bigint as past_rejected_count,
    ' || past_total_cnt || '::bigint as past_total_count
  FROM events e
  WHERE 1=1' || search_condition || '
  ORDER BY e.created_at DESC
  LIMIT ' || limit_count || ' OFFSET ' || offset_count;
END;
$function$;