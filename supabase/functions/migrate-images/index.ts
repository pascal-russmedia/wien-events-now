import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all events with base64 images
    const { data: events, error: fetchError } = await supabaseClient
      .from('events')
      .select('id, image')
      .not('image', 'is', null)
      .like('image', 'data:image/%')

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${events?.length || 0} events with base64 images`)

    let migratedCount = 0
    let errorCount = 0

    for (const event of events || []) {
      try {
        if (!event.image || !event.image.startsWith('data:image/')) {
          continue
        }

        // Extract file type and base64 data
        const matches = event.image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
        if (!matches) {
          console.error(`Invalid base64 format for event ${event.id}`)
          errorCount++
          continue
        }

        const [, fileType, base64Data] = matches
        const fileName = `migrated-${event.id}.${fileType}`

        // Convert base64 to blob
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('event-images')
          .upload(fileName, binaryData, {
            contentType: `image/${fileType}`,
            upsert: true
          })

        if (uploadError) {
          console.error(`Upload failed for event ${event.id}:`, uploadError)
          errorCount++
          continue
        }

        // Get public URL
        const { data: urlData } = supabaseClient.storage
          .from('event-images')
          .getPublicUrl(uploadData.path)

        // Update event with new image URL
        const { error: updateError } = await supabaseClient
          .from('events')
          .update({ image: urlData.publicUrl })
          .eq('id', event.id)

        if (updateError) {
          console.error(`Update failed for event ${event.id}:`, updateError)
          errorCount++
          continue
        }

        migratedCount++
        console.log(`Migrated image for event ${event.id}`)

      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration complete. Migrated: ${migratedCount}, Errors: ${errorCount}`,
        migratedCount,
        errorCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})