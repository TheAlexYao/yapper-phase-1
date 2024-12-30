import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"

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

    // Configure Azure Speech Service
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      Deno.env.get('AZURE_SPEECH_KEY') ?? '',
      Deno.env.get('AZURE_SPEECH_REGION') ?? ''
    )
    speechConfig.speechRecognitionLanguage = languageCode

    // Create audio config from the uploaded file
    const audioConfig = sdk.AudioConfig.fromWavFileInput(await audioFile.arrayBuffer())

    // Create recognizer and configure pronunciation assessment
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    
    // Configure pronunciation assessment
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText as string,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )
    
    pronunciationAssessmentConfig.applyTo(recognizer)

    // Perform recognition and assessment
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          if (result.errorDetails) {
            reject(new Error(result.errorDetails))
            return
          }
          resolve(result)
        },
        error => reject(error)
      )
    })

    console.log('Assessment completed:', result)

    // Process and return results
    const assessment = {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: result.pronunciationAssessment?.accuracyScore ?? 0,
          FluencyScore: result.pronunciationAssessment?.fluencyScore ?? 0,
          CompletenessScore: result.pronunciationAssessment?.completenessScore ?? 0,
          PronScore: result.pronunciationAssessment?.pronScore ?? 0
        },
        Words: result.pronunciationAssessment?.detailedWords?.map(word => ({
          Word: word.word,
          PronunciationAssessment: {
            AccuracyScore: word.accuracyScore,
            ErrorType: word.errorType
          }
        })) ?? []
      }],
      pronunciationScore: result.pronunciationAssessment?.pronScore ?? 0
    }

    console.log('Returning assessment:', { publicUrl, assessment })

    return new Response(
      JSON.stringify({ 
        audioUrl: publicUrl, 
        assessment 
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