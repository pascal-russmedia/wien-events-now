import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { descriptions } = await req.json();

    if (!descriptions || !Array.isArray(descriptions)) {
      throw new Error('descriptions array is required');
    }

    console.log('Processing', descriptions.length, 'descriptions for summarization');

    // Process descriptions in parallel
    const summarizedDescriptions = await Promise.all(
      descriptions.map(async (description: string, index: number) => {
        try {
          console.log(`Processing description ${index + 1}/${descriptions.length}`);
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: `Kürze die Eventbeschreibungen auf maximal 600 Zeichen.

- Falls sie bereits unter 600 Zeichen ist, belasse von der Länge unverändert.
- Falls sie länger ist, kürze sie sinnvoll auf 300–600 Zeichen, ohne den inhaltlichen Kern zu verlieren.
- Zeit- und Ortsangaben dürfen nicht inhaltlich geändert oder weggelassen werden.

Zusätzlich, verbessere die Beschreibung stilistisch nach folgenden Regeln:

1. Entferne alle Emojis.
2. Ersetze gerade Anführungszeichen (" ") durch typografische Anführungszeichen („ ").
3. Korrigiere grobe Rechtschreibfehler.
4. Datum im Format 29. Juli (Tag. Monat)
5. Uhrzeit im Format 12 Uhr, 12:30 Uhr

Gib ausschließlich die optimierte Beschreibung als Antwort aus, ohne Kommentare oder Erklärungen.`
                },
                {
                  role: 'user',
                  content: description
                }
              ],
              temperature: 0.3,
              max_tokens: 500
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API error for description ${index + 1}:`, errorText);
            // Return original description if API fails
            return description;
          }

          const data = await response.json();
          const summarizedText = data.choices[0]?.message?.content || description;
          
          console.log(`Description ${index + 1} processed successfully`);
          return summarizedText.trim();
        } catch (error) {
          console.error(`Error processing description ${index + 1}:`, error);
          // Return original description if processing fails
          return description;
        }
      })
    );

    console.log('All descriptions processed successfully');

    return new Response(JSON.stringify({ summarizedDescriptions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-summarize-descriptions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});