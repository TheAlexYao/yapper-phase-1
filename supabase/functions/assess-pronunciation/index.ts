import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createPronunciationConfig, LanguageConfig } from './utils/pronunciationConfig.ts'
import { createAudioConfig } from './utils/audioProcessing.ts'
import { calculateWeightedScores } from './utils/scoreCalculation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

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

    // Fetch language configuration
    const { data: languageConfig, error: configError } = await supabase
      .from('languages')
      .select('pronunciation_config')
      .eq('code', languageCode)
      .single()

    if (configError || !languageConfig) {
      console.error('Error fetching language config:', configError)
      throw new Error('Language configuration not found')
    }

    console.log('Retrieved language config:', languageConfig)

    const config = languageConfig as LanguageConfig
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure configuration missing')
    }

    // Configure speech service
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create pronunciation assessment config
    const pronunciationConfig = createPronunciationConfig(referenceText, languageCode)

    // Create audio config
    const audioConfig = await createAudioConfig(audioFile)
    
    // Create recognizer and perform assessment
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    pronunciationConfig.applyTo(recognizer)

    const result = await new Promise((resolve, reject) => {
      recognizer.recognizing = (s, e) => {
        console.log(`Recognition in progress: ${e.result.text}`)
      }

      recognizer.recognized = (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          console.log('Recognition successful:', {
            text: e.result.text,
            properties: e.result.properties.getPropertyList()
          })
          resolve(e.result)
        }
      }

      recognizer.canceled = (s, e) => {
        console.error('Recognition canceled:', {
          reason: e.reason,
          errorDetails: e.errorDetails
        })
        reject(new Error(`Recognition canceled: ${e.errorDetails}`))
      }

      recognizer.recognizeOnceAsync(
        result => {
          recognizer.close()
          resolve(result)
        },
        error => {
          console.error('Recognition error:', error)
          recognizer.close()
          reject(error)
        }
      )
    })

    if (!result) {
      throw new Error('Recognition failed')
    }

    const jsonResult = result.properties.getProperty(
      sdk.PropertyId.SpeechServiceResponse_JsonResult
    )

    console.log('Raw assessment result:', jsonResult)

    const assessment = JSON.parse(jsonResult)
    if (!assessment.NBest?.[0]?.PronunciationAssessment) {
      console.error('Invalid assessment format:', assessment)
      throw new Error('Invalid assessment response format')
    }

    // Calculate weighted scores
    const scores = calculateWeightedScores(assessment, {
      accuracyWeight: config.pronunciation_config.accuracyWeight,
      fluencyWeight: config.pronunciation_config.fluencyWeight,
      completenessWeight: config.pronunciation_config.completenessWeight
    })

    console.log('Recognition completed successfully with weighted scores:', scores)

    return new Response(
      JSON.stringify({ assessment }),
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
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})