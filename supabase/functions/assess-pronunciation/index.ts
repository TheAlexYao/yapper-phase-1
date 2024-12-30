import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    console.log('Starting pronunciation assessment...')

    // Get form data with explicit error handling
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (error) {
      console.error('Error parsing form data:', error)
      throw new Error('Invalid form data')
    }

    // Extract and validate required fields
    const audioFile = formData.get('audio') as File
    const referenceText = formData.get('text') as string
    const languageCode = formData.get('languageCode') as string

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    console.log('Processing request with:', {
      audioType: audioFile.type,
      audioSize: audioFile.size,
      referenceText,
      languageCode
    })

    // Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure configuration missing')
    }

    // Configure speech service
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Configure pronunciation assessment
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )

    console.log('Pronunciation assessment configured with:', {
      referenceText,
      gradingSystem: "HundredMark",
      granularity: "Word"
    })

    // Create audio config from the WAV file
    const audioData = await audioFile.arrayBuffer()
    const pushStream = sdk.AudioInputStream.createPushStream()
    
    // Write audio data in chunks to prevent memory issues
    const chunkSize = 32 * 1024 // 32KB chunks
    const audioArray = new Uint8Array(audioData)
    
    for (let i = 0; i < audioArray.length; i += chunkSize) {
      const chunk = audioArray.slice(i, i + chunkSize)
      pushStream.write(chunk)
    }
    pushStream.close()

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
    
    // Create recognizer and apply pronunciation assessment
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    pronunciationConfig.applyTo(recognizer)

    // Perform recognition with detailed logging
    const result = await new Promise((resolve) => {
      recognizer.recognized = (s, e) => {
        console.log('Recognition completed:', {
          resultText: e.result.text,
          hasJson: !!e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult),
          resultDuration: e.result.duration
        })
        
        const rawJson = e.result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)
        console.log('Raw assessment data:', rawJson)
        
        resolve(e.result)
      }

      recognizer.recognizeOnceAsync(
        result => {
          recognizer.close()
          resolve(result)
        },
        error => {
          console.error('Recognition error:', error)
          recognizer.close()
          resolve(null)
        }
      )
    })

    // Process results
    if (!result) {
      throw new Error('Recognition failed')
    }

    const assessment = {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 0,
          FluencyScore: 0,
          CompletenessScore: 0,
          PronScore: 0
        },
        Words: referenceText.split(' ').map(word => ({
          Word: word,
          Offset: 0,
          Duration: 0,
          PronunciationAssessment: {
            AccuracyScore: 0,
            ErrorType: "NoAssessment"
          }
        }))
      }],
      pronunciationScore: 0
    }

    if (result.properties) {
      const jsonResult = result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult)
      if (jsonResult) {
        try {
          const parsedResult = JSON.parse(jsonResult)
          console.log('Returning assessment:', { assessment: parsedResult })
          return new Response(
            JSON.stringify({ assessment: parsedResult }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Error parsing JSON result:', error)
        }
      }
    }

    // Return default assessment if no valid results
    console.log('Returning assessment:', { assessment })
    return new Response(
      JSON.stringify({ assessment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})