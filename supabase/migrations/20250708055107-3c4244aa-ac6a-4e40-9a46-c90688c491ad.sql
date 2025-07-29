-- Update get_internal_events_grouped function to support pagination
CREATE OR REPLACE FUNCTION public.get_internal_events_grouped(
  limit_count integer DEFAULT 100,
  offset_count integer DEFAULT 0
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
BEGIN
  -- Get counts for future events (events with at least one date >= today)
  SELECT 
    COALESCE(SUM(CASE WHEN e.state = 'Pending' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Approved' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Rejected' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO future_pending_cnt, future_approved_cnt, future_rejected_cnt, future_total_cnt
  FROM events e
  WHERE EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>'date')::date >= today_date
  );

  -- Get counts for past events (events with NO dates >= today)
  SELECT 
    COALESCE(SUM(CASE WHEN e.state = 'Pending' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Approved' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.state = 'Rejected' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO past_pending_cnt, past_approved_cnt, past_rejected_cnt, past_total_cnt
  FROM events e
  WHERE NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(e.dates) AS d 
    WHERE (d.value->>'date')::date >= today_date
  );

  -- Return paginated events with grouping information and counts
  RETURN QUERY
  SELECT 
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
      WHERE (d.value->>'date')::date >= today_date
    ) as is_future,
    future_pending_cnt as future_pending_count,
    future_approved_cnt as future_approved_count,
    future_rejected_cnt as future_rejected_count,
    future_total_cnt as future_total_count,
    past_pending_cnt as past_pending_count,
    past_approved_cnt as past_approved_count,
    past_rejected_cnt as past_rejected_count,
    past_total_cnt as past_total_count
  FROM events e
  ORDER BY e.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$function$;