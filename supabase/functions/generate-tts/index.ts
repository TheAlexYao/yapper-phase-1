import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScriptLine {
  lineNumber: number
  speaker: string
  targetText: string
  transliteration: string | null
  translation: string
  audioUrl: string | null
}

interface ScriptData {
  lines: ScriptLine[]
  languageCode: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    console.log('Fetching scripts that need TTS generation...')
    
    const { data: scripts, error: fetchError } = await supabase
      .from('scripts')
      .select('*')
      .eq('audio_generated', false)
      .limit(5) // Process in batches

    if (fetchError) {
      throw new Error(`Error fetching scripts: ${fetchError.message}`)
    }

    if (!scripts || scripts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No scripts need TTS generation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${scripts.length} scripts...`)

    for (const script of scripts) {
      const scriptData: ScriptData = script.script_data
      let modified = false

      for (const line of scriptData.lines) {
        if (!line.audioUrl) {
          try {
            // Prepare TTS request
            const ssml = `
              <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${scriptData.languageCode}">
                <voice name="${line.speaker === 'character' ? 'es-ES-ElviraNeural' : 'es-ES-AlvaroNeural'}">
                  <prosody rate="0.9">
                    ${line.targetText}
                  </prosody>
                </voice>
              </speak>`

            // Call Azure TTS API
            const response = await fetch(
              `https://${Deno.env.get('AZURE_SPEECH_REGION')}.tts.speech.microsoft.com/cognitiveservices/v1`,
              {
                method: 'POST',
                headers: {
                  'Ocp-Apim-Subscription-Key': Deno.env.get('AZURE_SPEECH_KEY') ?? '',
                  'Content-Type': 'application/ssml+xml',
                  'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
                },
                body: ssml,
              }
            )

            if (!response.ok) {
              throw new Error(`Azure TTS API error: ${response.statusText}`)
            }

            const audioBuffer = await response.arrayBuffer()
            const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })

            // Upload to Supabase Storage
            const fileName = `${script.id}_line${line.lineNumber}_${Date.now()}.mp3`
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('tts_cache')
              .upload(fileName, audioBlob, {
                contentType: 'audio/mpeg',
                cacheControl: '3600',
              })

            if (uploadError) {
              throw new Error(`Storage upload error: ${uploadError.message}`)
            }

            // Get public URL
            const { data: publicUrl } = supabase.storage
              .from('tts_cache')
              .getPublicUrl(fileName)

            line.audioUrl = publicUrl.publicUrl
            modified = true

            console.log(`Generated TTS for line ${line.lineNumber} in script ${script.id}`)
          } catch (error) {
            console.error(`Error processing line ${line.lineNumber} in script ${script.id}:`, error)
            throw error
          }
        }
      }

      if (modified) {
        // Update script with new audio URLs
        const { error: updateError } = await supabase
          .from('scripts')
          .update({
            script_data: scriptData,
            audio_generated: true,
          })
          .eq('id', script.id)

        if (updateError) {
          throw new Error(`Error updating script: ${updateError.message}`)
        }

        console.log(`Updated script ${script.id} with TTS audio URLs`)
      }
    }

    return new Response(
      JSON.stringify({ message: 'TTS generation completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in TTS generation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})