-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_future_events_by_state();
DROP FUNCTION IF EXISTS public.get_past_events_by_state();

-- Create updated function for future events with pagination by state
CREATE FUNCTION public.get_future_events_by_state(
  state_filter text DEFAULT 'all',
  page_number integer DEFAULT 1,
  page_size integer DEFAULT 100
)
RETURNS TABLE(
  -- Event data
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
  -- Counts for each state
  pending_count bigint,
  approved_count bigint,
  rejected_count bigint,
  total_count bigint,
  -- Pagination info for current state
  current_state_total bigint,
  current_state_pages bigint
)
LANGUAGE plpgsql
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  pending_cnt bigint := 0;
  approved_cnt bigint := 0;
  rejected_cnt bigint := 0;
  total_cnt bigint := 0;
  current_state_total_cnt bigint := 0;
  offset_count integer := (page_number - 1) * page_size;
BEGIN
  -- Get counts for each state
  SELECT 
    COALESCE(SUM(CASE WHEN e.state = 'Pending' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Approved' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Rejected' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO pending_cnt, approved_cnt, rejected_cnt, total_cnt
  FROM events e
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>'date')::date >= today_date
  );

  -- Get count for current state filter
  IF state_filter = 'all' THEN
    current_state_total_cnt := total_cnt;
  ELSIF state_filter = 'Pending' THEN
    current_state_total_cnt := pending_cnt;
  ELSIF state_filter = 'Approved' THEN
    current_state_total_cnt := approved_cnt;
  ELSIF state_filter = 'Rejected' THEN
    current_state_total_cnt := rejected_cnt;
  END IF;

  -- Return paginated events for the specified state
  RETURN QUERY
  SELECT 
    e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
    e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
    e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
    e.added_by_email, e.created_at, e.updated_at,
    pending_cnt::bigint as pending_count,
    approved_cnt::bigint as approved_count,
    rejected_cnt::bigint as rejected_count,
    total_cnt::bigint as total_count,
    current_state_total_cnt::bigint as current_state_total,
    CEIL(current_state_total_cnt::numeric / page_size)::bigint as current_state_pages
  FROM events e
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>'date')::date >= today_date
  )
  AND (state_filter = 'all' OR e.state = state_filter)
  ORDER BY e.created_at DESC
  LIMIT page_size OFFSET offset_count;
END;
$function$;

-- Create updated function for past events with pagination by state
CREATE FUNCTION public.get_past_events_by_state(
  state_filter text DEFAULT 'all',
  page_number integer DEFAULT 1,
  page_size integer DEFAULT 100
)
RETURNS TABLE(
  -- Event data
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
  -- Counts for each state
  pending_count bigint,
  approved_count bigint,
  rejected_count bigint,
  total_count bigint,
  -- Pagination info for current state
  current_state_total bigint,
  current_state_pages bigint
)
LANGUAGE plpgsql
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  pending_cnt bigint := 0;
  approved_cnt bigint := 0;
  rejected_cnt bigint := 0;
  total_cnt bigint := 0;
  current_state_total_cnt bigint := 0;
  offset_count integer := (page_number - 1) * page_size;
BEGIN
  -- Get counts for each state
  SELECT 
    COALESCE(SUM(CASE WHEN e.state = 'Pending' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Approved' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Rejected' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO pending_cnt, approved_cnt, rejected_cnt, total_cnt
  FROM events e
  WHERE NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>'date')::date >= today_date
  );

  -- Get count for current state filter
  IF state_filter = 'all' THEN
    current_state_total_cnt := total_cnt;
  ELSIF state_filter = 'Pending' THEN
    current_state_total_cnt := pending_cnt;
  ELSIF state_filter = 'Approved' THEN
    current_state_total_cnt := approved_cnt;
  ELSIF state_filter = 'Rejected' THEN
    current_state_total_cnt := rejected_cnt;
  END IF;

  -- Return paginated events for the specified state
  RETURN QUERY
  SELECT 
    e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
    e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
    e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
    e.added_by_email, e.created_at, e.updated_at,
    pending_cnt::bigint as pending_count,
    approved_cnt::bigint as approved_count,
    rejected_cnt::bigint as rejected_count,
    total_cnt::bigint as total_count,
    current_state_total_cnt::bigint as current_state_total,
    CEIL(current_state_total_cnt::numeric / page_size)::bigint as current_state_pages
  FROM events e
  WHERE NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>'date')::date >= today_date
  )
  AND (state_filter = 'all' OR e.state = state_filter)
  ORDER BY e.created_at DESC
  LIMIT page_size OFFSET offset_count;
END;
$function$;