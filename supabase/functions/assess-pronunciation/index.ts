import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // For now, return a mock response while we debug
    const mockAssessment = {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 80,
          FluencyScore: 85,
          CompletenessScore: 90,
          PronScore: 85
        },
        Words: [{
          Word: referenceText,
          PronunciationAssessment: {
            AccuracyScore: 80,
            ErrorType: "None"
          }
        }]
      }],
      pronunciationScore: 85
    }

    // Store the audio file
    const audioUrl = `https://example.com/mock-audio-url.wav` // This will be replaced with actual storage logic

    return new Response(
      JSON.stringify({ 
        audioUrl, 
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