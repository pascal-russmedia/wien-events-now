import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('OpenAI Scoring function called');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const { eventId, eventData } = await req.json();
    
    if (!eventId || !eventData) {
      throw new Error('Event ID and event data are required');
    }

    console.log('Processing OpenAI scoring for event:', eventId);
    console.log('Event data:', eventData);

    // Create Supabase client with service role key for database updates
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare event details for OpenAI analysis
    const eventDetails = {
      name: eventData.name,
      description: eventData.description,
      category: eventData.category,
      subcategory: eventData.subcategory,
      region: eventData.region,
      subregion: eventData.subregion,
      city: eventData.city,
      host: eventData.host,
      address: eventData.address,
      dates: eventData.dates,
      priceType: eventData.price?.type,
      priceAmount: eventData.price?.amount,
      hasImage: !!eventData.image,
      hasLink: !!eventData.link,
      hasTicketLink: !!eventData.ticketLink
    };

    // System prompt for OpenAI analysis
    const systemPrompt = `### **Aufgabe**

Für einen Online Veranstaltungskalender bei dem User Events hinzufügen können gibt es zwei Aufgaben zu erledigen. Für jedes neu hinzugefügte Event wollen a) einen Popularity Score (0-30) und b) einen Trust Score (0-100) ermitteln. Analysiere das ganze Event (Json) mit GPT 4.0 mini.

a.) Popularity Score (0–30)
Bewertungskriterien sind Zielgruppeninteresse, Bekanntheit und Exklusivität.

- Zielgruppeninteresse (bis zu 20 Punkte)
    - Wie gut passt das Event zu den Zielgruppen junge Erwachsene (16-30 Jahre), junge Familien mit Kindern und Touristen (20-50 Jahre). Interessant sind Festivals (z.B. Musik, Food, Familien, Bier, Wein, Tradition, Genuss, Zeltfeste), Konzerte (regional sowie mit bekannten Bands), lokale Erlebnisse für Familie & Kinder (z.B. Theater, Tiere) und Outdoor Events (Wandern, Sport).
- Bekanntheit (bis zu 5 Punkte)
    - Events bei denen viele Besucher erwartet werden sind interessanter wie kleine Nischenevents.
- Exklusivität (bis zu 5 Punkte)
    - Events die weniger Termine haben < 5 sind interessanter wie Events die ≥ 5 mal stattfinden.

b.) Trust Score
Bewertungskriterien sind Inhaltliche Sicherheit und Plausibilität.

- Inhaltliche Sicherheit
Zuerst prüfst du, ob verbotene Inhalte vorliegen. Wenn eine der folgenden Kategorien zutrifft, wird der Event sofort abgelehnt (Score = 0 ):
    - Gewaltverherrlichung
    - Pornografie oder extrem grausame Inhalte
    - Diskriminierung oder Hassrede
    - Extremismus oder Aufrufe zu illegalem Verhalten
    - Betrugsverdacht oder Scam-Elemente
    - Spam oder irrelevant viel Werbung
- Plausibilitätsprüfung
Wenn der Inhalt sicher ist, wird der Event auf Plausibilität geprüft und Punkte von 0-100 vergeben. 100 Punkte bekommt ein Event mit gutem und schlüssigem Inhalt bei dem die Rechtschreibung zum Großteil korrekt ist.
    - Name/Beschreibung glaubwürdig und inhaltlich wertvoll
    - Ort/Adresse realistisch
    - Rechtschreibung in Ordnung

### **Ausgabeformat**

Json Respone mit popularity_score und trust_score.

Return ONLY a JSON object with this exact format:
{
  "popularity_score": number,
  "trust_score": number,
  "reasoning": "Brief explanation of scoring"
}`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Analyze this event and provide popularity and trust scores:\n\n${JSON.stringify(eventDetails, null, 2)}` 
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid OpenAI response format');
    }

    // Parse OpenAI response
    let scores;
    try {
      scores = JSON.parse(aiResponse.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', aiResponse.choices[0].message.content);
      throw new Error('Failed to parse OpenAI scoring response');
    }

    if (typeof scores.popularity_score !== 'number' || typeof scores.trust_score !== 'number') {
      throw new Error('Invalid score format from OpenAI');
    }

    // Validate scores are within expected ranges
    const popularityScore = Math.max(0, Math.min(30, Math.round(scores.popularity_score)));
    const trustScore = Math.max(0, Math.min(100, Math.round(scores.trust_score)));

    console.log('OpenAI scores:', { popularityScore, trustScore, reasoning: scores.reasoning });

    // Get current event data to calculate new total popularity score
    const { data: currentEvent, error: fetchError } = await supabase
      .from('events')
      .select('popularity_score, image, featured, trust_score, added_by')
      .eq('id', eventId)
      .single();

    if (fetchError) {
      console.error('Error fetching current event:', fetchError);
      throw fetchError;
    }

    // Check if this is an internal event
    const isInternalEvent = currentEvent.added_by === 'Internal';
    console.log('Is internal event:', isInternalEvent);

    // Calculate new total popularity score
    // Base scores from image (20) and featured (5 for internal events)
    const imageScore = currentEvent.image ? 20 : 0;
    const featuredScore = currentEvent.featured ? 5 : 0;
    const newPopularityScore = imageScore + featuredScore + popularityScore;

    // For internal events, preserve the existing trust_score (should be 100)
    // For other events, use the OpenAI calculated trust_score
    const finalTrustScore = isInternalEvent ? (currentEvent.trust_score || 100) : trustScore;

    console.log('Calculating new popularity score:', {
      imageScore,
      featuredScore,
      aiPopularityScore: popularityScore,
      newTotal: newPopularityScore
    });

    console.log('Trust score logic:', {
      isInternalEvent,
      currentTrustScore: currentEvent.trust_score,
      aiTrustScore: trustScore,
      finalTrustScore
    });

    // Update event with OpenAI scores
    const { error: updateError } = await supabase
      .from('events')
      .update({
        popularity_score: newPopularityScore,
        trust_score: finalTrustScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('Error updating event scores:', updateError);
      throw updateError;
    }

    console.log('Successfully updated event scores for:', eventId);

    return new Response(JSON.stringify({
      success: true,
      eventId,
      scores: {
        popularity_score: newPopularityScore,
        trust_score: finalTrustScore,
        ai_popularity_contribution: popularityScore,
        ai_trust_contribution: isInternalEvent ? 'ignored (internal event)' : trustScore,
        reasoning: scores.reasoning
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-scoring function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});