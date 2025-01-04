import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPronunciationConfig } from './utils/pronunciationConfig.ts'
import { createAudioConfig } from './utils/audioProcessing.ts'
import { calculateWeightedScores } from './utils/scoreCalculation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const referenceText = formData.get('text') as string
    const languageCode = formData.get('languageCode') as string

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    console.log('Processing request:', {
      audioType: audioFile.type,
      audioSize: audioFile.size,
      referenceText,
      languageCode
    })

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get language-specific configuration
    const { data: languageData, error: languageError } = await supabase
      .from('languages')
      .select('pronunciation_config')
      .eq('code', languageCode)
      .single()

    if (languageError || !languageData) {
      throw new Error(`Failed to get language config: ${languageError?.message}`)
    }

    console.log('Retrieved language config:', languageData)

    // Set up Azure Speech configuration
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')
    if (!speechKey || !speechRegion) {
      throw new Error('Missing Azure Speech configuration')
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create pronunciation assessment config
    const pronunciationConfig = createPronunciationConfig(referenceText, languageCode)
    
    // Create audio config from the uploaded file
    const audioConfig = await createAudioConfig(audioFile)

    // Create recognizer and apply pronunciation assessment
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    pronunciationConfig.applyTo(recognizer)

    return new Promise((resolve) => {
      let finalResult: any = null;

      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const jsonResult = e.result.properties.getProperty(
            sdk.PropertyId.SpeechServiceResponse_JsonResult
          )
          
          console.log('Raw assessment result:', jsonResult)

          const assessment = JSON.parse(jsonResult)
          if (!assessment.NBest?.[0]?.PronunciationAssessment) {
            console.error('Invalid assessment format:', assessment)
            throw new Error('Invalid assessment response format')
          }

          // Calculate weighted scores based on language config
          const weights = languageData.pronunciation_config
          const scores = calculateWeightedScores(
            assessment.NBest[0].PronunciationAssessment,
            weights
          )

          console.log('Recognition completed successfully with weighted scores:', scores)

          finalResult = {
            NBest: [
              {
                ...assessment.NBest[0],
                PronunciationAssessment: {
                  ...assessment.NBest[0].PronunciationAssessment,
                  finalScore: scores.finalScore,
                  weightedAccuracyScore: scores.accuracyScore,
                  weightedFluencyScore: scores.fluencyScore,
                  weightedCompletenessScore: scores.completenessScore,
                  pronScore: scores.pronScore
                }
              }
            ]
          }
        }
      }

      recognizer.recognizeOnceAsync(
        result => {
          recognizer.close()
          
          if (!finalResult) {
            resolve(new Response(
              JSON.stringify({ error: 'No valid pronunciation assessment result' }),
              { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            ))
            return
          }

          resolve(new Response(
            JSON.stringify({ assessment: finalResult }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          ))
        },
        error => {
          console.error('Error during recognition:', error)
          recognizer.close()
          resolve(new Response(
            JSON.stringify({ error: 'Recognition failed' }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          ))
        }
      )
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})