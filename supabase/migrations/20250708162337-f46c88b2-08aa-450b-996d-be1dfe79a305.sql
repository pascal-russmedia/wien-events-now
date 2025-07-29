-- Fix get_future_events_by_state to always return counts even when no events match
CREATE OR REPLACE FUNCTION public.get_future_events_by_state(state_filter text DEFAULT 'all'::text, page_number integer DEFAULT 1, page_size integer DEFAULT 100)
 RETURNS TABLE(id uuid, name text, category text, subcategory text, description text, region text, subregion text, host text, address text, state text, popularity_score integer, trust_score integer, dates jsonb, image text, price_type text, price_amount numeric, link text, featured boolean, added_by text, added_by_email text, created_at timestamp with time zone, updated_at timestamp with time zone, pending_count bigint, approved_count bigint, rejected_count bigint, total_count bigint, current_state_total bigint, current_state_pages bigint)
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
  normalized_state_filter text;
  has_results boolean := false;
BEGIN
  -- Normalize state filter to proper case
  IF state_filter = 'pending' THEN
    normalized_state_filter := 'Pending';
  ELSIF state_filter = 'approved' THEN
    normalized_state_filter := 'Approved';
  ELSIF state_filter = 'rejected' THEN
    normalized_state_filter := 'Rejected';
  ELSE
    normalized_state_filter := 'all';
  END IF;

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
  IF normalized_state_filter = 'all' THEN
    current_state_total_cnt := total_cnt;
  ELSIF normalized_state_filter = 'Pending' THEN
    current_state_total_cnt := pending_cnt;
  ELSIF normalized_state_filter = 'Approved' THEN
    current_state_total_cnt := approved_cnt;
  ELSIF normalized_state_filter = 'Rejected' THEN
    current_state_total_cnt := rejected_cnt;
  END IF;

  -- Check if there are any results for the main query
  SELECT EXISTS(
    SELECT 1
    FROM events e
    WHERE EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(e.dates) AS d 
      WHERE (d.value->>'date')::date >= today_date
    )
    AND (normalized_state_filter = 'all' OR e.state = normalized_state_filter)
    LIMIT 1
  ) INTO has_results;

  -- If no results, return one row with null event data but real counts
  IF NOT has_results THEN
    RETURN QUERY
    SELECT 
      NULL::uuid as id, NULL::text as name, NULL::text as category, NULL::text as subcategory, 
      NULL::text as description, NULL::text as region, NULL::text as subregion,
      NULL::text as host, NULL::text as address, NULL::text as state, 
      NULL::integer as popularity_score, NULL::integer as trust_score, NULL::jsonb as dates,
      NULL::text as image, NULL::text as price_type, NULL::numeric as price_amount, 
      NULL::text as link, NULL::boolean as featured, NULL::text as added_by,
      NULL::text as added_by_email, NULL::timestamp with time zone as created_at, 
      NULL::timestamp with time zone as updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count,
      current_state_total_cnt::bigint as current_state_total,
      CEIL(current_state_total_cnt::numeric / page_size)::bigint as current_state_pages;
    RETURN;
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
  AND (normalized_state_filter = 'all' OR e.state = normalized_state_filter)
  ORDER BY e.created_at DESC
  LIMIT page_size OFFSET offset_count;
END;
$function$;

-- Fix get_past_events_by_state to always return counts even when no events match
CREATE OR REPLACE FUNCTION public.get_past_events_by_state(state_filter text DEFAULT 'all'::text, page_number integer DEFAULT 1, page_size integer DEFAULT 100)
 RETURNS TABLE(id uuid, name text, category text, subcategory text, description text, region text, subregion text, host text, address text, state text, popularity_score integer, trust_score integer, dates jsonb, image text, price_type text, price_amount numeric, link text, featured boolean, added_by text, added_by_email text, created_at timestamp with time zone, updated_at timestamp with time zone, pending_count bigint, approved_count bigint, rejected_count bigint, total_count bigint, current_state_total bigint, current_state_pages bigint)
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
  normalized_state_filter text;
  has_results boolean := false;
BEGIN
  -- Normalize state filter to proper case
  IF state_filter = 'pending' THEN
    normalized_state_filter := 'Pending';
  ELSIF state_filter = 'approved' THEN
    normalized_state_filter := 'Approved';
  ELSIF state_filter = 'rejected' THEN
    normalized_state_filter := 'Rejected';
  ELSE
    normalized_state_filter := 'all';
  END IF;

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
  IF normalized_state_filter = 'all' THEN
    current_state_total_cnt := total_cnt;
  ELSIF normalized_state_filter = 'Pending' THEN
    current_state_total_cnt := pending_cnt;
  ELSIF normalized_state_filter = 'Approved' THEN
    current_state_total_cnt := approved_cnt;
  ELSIF normalized_state_filter = 'Rejected' THEN
    current_state_total_cnt := rejected_cnt;
  END IF;

  -- Check if there are any results for the main query
  SELECT EXISTS(
    SELECT 1
    FROM events e
    WHERE NOT EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(e.dates) AS d 
      WHERE (d.value->>'date')::date >= today_date
    )
    AND (normalized_state_filter = 'all' OR e.state = normalized_state_filter)
    LIMIT 1
  ) INTO has_results;

  -- If no results, return one row with null event data but real counts
  IF NOT has_results THEN
    RETURN QUERY
    SELECT 
      NULL::uuid as id, NULL::text as name, NULL::text as category, NULL::text as subcategory, 
      NULL::text as description, NULL::text as region, NULL::text as subregion,
      NULL::text as host, NULL::text as address, NULL::text as state, 
      NULL::integer as popularity_score, NULL::integer as trust_score, NULL::jsonb as dates,
      NULL::text as image, NULL::text as price_type, NULL::numeric as price_amount, 
      NULL::text as link, NULL::boolean as featured, NULL::text as added_by,
      NULL::text as added_by_email, NULL::timestamp with time zone as created_at, 
      NULL::timestamp with time zone as updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count,
      current_state_total_cnt::bigint as current_state_total,
      CEIL(current_state_total_cnt::numeric / page_size)::bigint as current_state_pages;
    RETURN;
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
  AND (normalized_state_filter = 'all' OR e.state = normalized_state_filter)
  ORDER BY e.created_at DESC
  LIMIT page_size OFFSET offset_count;
END;
$function$;