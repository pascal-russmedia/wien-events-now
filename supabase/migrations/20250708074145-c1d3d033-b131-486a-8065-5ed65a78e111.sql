-- Drop the old function
DROP FUNCTION IF EXISTS public.get_internal_events_grouped(integer, integer);

-- Create function for future events grouped by state
CREATE FUNCTION public.get_future_events_by_state()
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
  total_count bigint
)
LANGUAGE plpgsql
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  pending_cnt bigint := 0;
  approved_cnt bigint := 0;
  rejected_cnt bigint := 0;
  total_cnt bigint := 0;
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

  -- Return up to 100 events from each state, ordered by creation date
  RETURN QUERY
  (
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count
    FROM events e
    WHERE e.state = 'Pending' 
      AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(e.dates) AS d 
        WHERE (d.value->>'date')::date >= today_date
      )
    ORDER BY e.created_at DESC
    LIMIT 100
  )
  UNION ALL
  (
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count
    FROM events e
    WHERE e.state = 'Approved'
      AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(e.dates) AS d 
        WHERE (d.value->>'date')::date >= today_date
      )
    ORDER BY e.created_at DESC
    LIMIT 100
  )
  UNION ALL
  (
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count
    FROM events e
    WHERE e.state = 'Rejected'
      AND EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(e.dates) AS d 
        WHERE (d.value->>'date')::date >= today_date
      )
    ORDER BY e.created_at DESC
    LIMIT 100
  );
END;
$function$;

-- Create function for past events grouped by state
CREATE FUNCTION public.get_past_events_by_state()
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
  total_count bigint
)
LANGUAGE plpgsql
AS $function$
DECLARE
  today_date date := CURRENT_DATE;
  pending_cnt bigint := 0;
  approved_cnt bigint := 0;
  rejected_cnt bigint := 0;
  total_cnt bigint := 0;
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

  -- Return up to 100 events from each state, ordered by creation date
  RETURN QUERY
  (
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count
    FROM events e
    WHERE e.state = 'Pending' 
      AND NOT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(e.dates) AS d 
        WHERE (d.value->>'date')::date >= today_date
      )
    ORDER BY e.created_at DESC
    LIMIT 100
  )
  UNION ALL
  (
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count
    FROM events e
    WHERE e.state = 'Approved'
      AND NOT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(e.dates) AS d 
        WHERE (d.value->>'date')::date >= today_date
      )
    ORDER BY e.created_at DESC
    LIMIT 100
  )
  UNION ALL
  (
    SELECT 
      e.id, e.name, e.category, e.subcategory, e.description, e.region, e.subregion,
      e.host, e.address, e.state, e.popularity_score, e.trust_score, e.dates,
      e.image, e.price_type, e.price_amount, e.link, e.featured, e.added_by,
      e.added_by_email, e.created_at, e.updated_at,
      pending_cnt::bigint as pending_count,
      approved_cnt::bigint as approved_count,
      rejected_cnt::bigint as rejected_count,
      total_cnt::bigint as total_count
    FROM events e
    WHERE e.state = 'Rejected'
      AND NOT EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(e.dates) AS d 
        WHERE (d.value->>'date')::date >= today_date
      )
    ORDER BY e.created_at DESC
    LIMIT 100
  );
END;
$function$;