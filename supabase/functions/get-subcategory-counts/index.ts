import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { 
      region_filter, 
      category_filter, 
      single_date_filter, 
      start_date_filter, 
      end_date_filter 
    } = await req.json()

    console.log('Getting subcategory counts for:', {
      region_filter,
      category_filter,
      single_date_filter,
      start_date_filter,
      end_date_filter
    })

    console.log('Building query with filters...')

    // Use the same logic as get_expanded_future_events database function
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Build the same query as the database function
    let query = supabase
      .from('events')
      .select('subcategory, dates')
      .eq('state', 'Approved')
      .limit(50000)

    // Apply region filter (same as database function)
    if (region_filter && region_filter !== 'Vorarlberg') {
      query = query.or(`region.eq.${region_filter},subregion.eq.${region_filter}`)
    } else {
      query = query.eq('region', 'Vorarlberg')
    }

    // Apply category filter (same as database function)
    if (category_filter) {
      query = query.eq('category', category_filter)
    }

    // Get all events that match the filters
    const { data: events, error } = await query

    console.log(`Fetched ${events?.length || 0} events from database`)
    
    // Log sample events for debugging
    if (events && events.length > 0) {
      console.log('Sample of first 3 events:', events.slice(0, 3).map(e => ({
        subcategory: e.subcategory,
        dates: e.dates
      })))
    }

    if (error) {
      console.error('Error fetching events:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch events' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  // Define subcategories for each category (matching frontend types with German categories)
  const SUBCATEGORIES: { [key: string]: string[] } = {
    'Party & Musik': [
      'Pop',
      'House',
      'Rock',
      'Festival',
      'Volksmusik',
      'Zeltfest',
      'Clubbing',
      'Ball',
      'Jazz, Blues, Swing',
      'Fasching',
      'Silvester',
      'Alternativ, Indie',
      'Hip Hop, Rap',
      'Latin, Salsa',
      'R&B, Soul',
      'Country',
      'Punk',
      'Reggae, Roots, Dub',
      'Metal'
    ],
    'Familie & Freizeit': [
      'Essen, Trinken',
      'Feste',
      'Tanzen',
      'Kinder, Jugend',
      'Gesundheit',
      'Führungen',
      'Märkte',
      'Seminare, Kurse',
      'Bildung',
      'Spiele',
      'Advent',
      'Charity',
      'Kirche',
      'Senioren',
      'Diskussionen',
      'Umzüge',
      'Vereine',
      'Wissenschaft',
      'Business',
      'Messen',
      'Politik',
      'Landwirtschaft',
      'Funken'
    ],
    'Sport & Outdoor': [
      'Wandern',
      'Wintersport',
      'Radsport',
      'Fußball',
      'Fitness',
      'Marathon, Laufen',
      'Ballsport',
      'Wassersport',
      'Golf',
      'Pferde',
      'Leichtathletik',
      'Kampfsport',
      'Motorsport',
      'Bootsport',
      'Abenteuer',
      'Schießen',
      'Flugsport'
    ],
    'Kultur & Bühne': [
      'Theater',
      'Klassische Musik',
      'Museen',
      'Kunst',
      'Oper',
      'Film',
      'Musicals',
      'Kabarett, Comedy',
      'Tanz',
      'Literatur, Lesung',
      'Mode',
      'Chor, Gesang',
      'Fotografie'
    ]
  };

  // Use the same database function approach for accurate counts
  const subcategoryCounts: { [key: string]: number } = {}
  const availableSubcategories = SUBCATEGORIES[category_filter] || []

  console.log('Getting counts using database function approach...')
  console.log(`Category: ${category_filter}, Available subcategories:`, availableSubcategories)

  // Get count for each subcategory using the same database function
  for (const subcategory of availableSubcategories) {
    try {
      console.log(`Getting count for subcategory: ${subcategory}`)
      
      const { data: subcategoryData, error: subcategoryError } = await supabase.rpc('get_expanded_future_events', {
        region_filter: region_filter || 'Vorarlberg',
        category_filter: category_filter,
        subcategory_filter: subcategory,
        single_date_filter: single_date_filter,
        start_date_filter: start_date_filter,
        end_date_filter: end_date_filter,
        limit_count: 1, // We only need the total_count, not the actual data
        offset_count: 0
      })

      if (subcategoryError) {
        console.error(`Error getting count for ${subcategory}:`, subcategoryError)
        subcategoryCounts[subcategory] = 0
      } else {
        const count = subcategoryData && subcategoryData.length > 0 ? subcategoryData[0].total_count : 0
        subcategoryCounts[subcategory] = count
        console.log(`Subcategory ${subcategory}: ${count} events`)
      }
    } catch (error) {
      console.error(`Exception getting count for ${subcategory}:`, error)
      subcategoryCounts[subcategory] = 0
    }
  }

  console.log('Final subcategory counts:', subcategoryCounts)

    return new Response(
      JSON.stringify({ subcategoryCounts }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in get-subcategory-counts:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})