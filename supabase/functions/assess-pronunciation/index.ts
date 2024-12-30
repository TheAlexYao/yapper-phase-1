import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting pronunciation assessment...')
    const formData = await req.formData()
    const audioFile = formData.get('audio')
    const referenceText = formData.get('text')
    const languageCode = formData.get('languageCode')

    console.log('Received request:', {
      hasAudio: !!audioFile,
      referenceText,
      languageCode
    })

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    // Upload audio file to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `${crypto.randomUUID()}.wav`
    const filePath = `recordings/${fileName}`

    console.log('Uploading audio file to storage...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filePath, audioFile, {
        contentType: 'audio/wav',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading audio:', uploadError)
      throw new Error('Failed to upload audio file')
    }

    // Get public URL for the uploaded audio
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath)

    console.log('Audio file uploaded successfully:', publicUrl)

    // For now, return a mock assessment while we implement the actual Azure Speech Service integration
    const mockAssessment = {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
          FluencyScore: Math.floor(Math.random() * 20) + 80,
          CompletenessScore: Math.floor(Math.random() * 20) + 80,
          PronScore: Math.floor(Math.random() * 20) + 80
        },
        Words: referenceText.split(' ').map(word => ({
          Word: word,
          PronunciationAssessment: {
            AccuracyScore: Math.floor(Math.random() * 20) + 80,
            ErrorType: "None"
          }
        }))
      }],
      pronunciationScore: Math.floor(Math.random() * 20) + 80
    }

    console.log('Returning assessment:', { publicUrl, mockAssessment })

    return new Response(
      JSON.stringify({ 
        audioUrl: publicUrl, 
        assessment: mockAssessment 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error in assess-pronunciation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})