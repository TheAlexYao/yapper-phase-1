import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const referenceText = formData.get('text') as string
    const languageCode = formData.get('languageCode') as string

    console.log('Processing request with:', {
      hasAudio: !!audioFile,
      referenceText,
      languageCode,
      audioType: audioFile?.type,
      audioSize: audioFile?.size
    })

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    // Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    console.log('Azure credentials loaded successfully')

    // Configure Azure Speech Services
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create a push stream for the audio data
    const pushStream = sdk.AudioInputStream.createPushStream()
    
    // Get audio data and write to stream
    const arrayBuffer = await audioFile.arrayBuffer()
    
    // Convert WAV to raw PCM data by skipping WAV header (44 bytes)
    const audioData = new Uint8Array(arrayBuffer).slice(44)
    pushStream.write(audioData)
    pushStream.close()

    console.log('Audio data processed and written to stream:', {
      originalSize: arrayBuffer.byteLength,
      processedSize: audioData.length
    })

    // Create audio config from push stream
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

    // Create recognizer with detailed logging
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    console.log('Speech recognizer created')

    // Configure pronunciation assessment with detailed settings
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )

    console.log('Pronunciation assessment configured with:', {
      referenceText,
      gradingSystem: 'HundredMark',
      granularity: 'Word'
    })

    pronunciationConfig.applyTo(recognizer)

    // Perform recognition and assessment with detailed error handling
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          console.log('Recognition completed:', {
            resultText: result.text,
            hasJson: !!result.privJson,
            resultDuration: result.duration
          })
          resolve(result)
        },
        error => {
          console.error('Recognition error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
          reject(error)
        }
      )
    })

    // Extract and validate assessment data
    let assessment = null
    if (result && result.privJson) {
      try {
        const jsonData = JSON.parse(result.privJson)
        console.log('Raw assessment data:', JSON.stringify(jsonData, null, 2))
        
        if (jsonData.NBest && jsonData.NBest[0]) {
          const nBestResult = jsonData.NBest[0]
          assessment = {
            NBest: [{
              PronunciationAssessment: {
                AccuracyScore: nBestResult.PronunciationAssessment.AccuracyScore,
                FluencyScore: nBestResult.PronunciationAssessment.FluencyScore,
                CompletenessScore: nBestResult.PronunciationAssessment.CompletenessScore,
                PronScore: nBestResult.PronunciationAssessment.PronScore
              },
              Words: nBestResult.Words.map((word: any) => ({
                Word: word.Word,
                Offset: word.Offset || 0,
                Duration: word.Duration || 0,
                PronunciationAssessment: {
                  AccuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                  ErrorType: word.PronunciationAssessment?.ErrorType || "None"
                }
              }))
            }],
            pronunciationScore: nBestResult.PronunciationAssessment.PronScore
          }
        }
      } catch (error) {
        console.error('Error parsing assessment data:', error)
        throw error
      }
    }

    if (!assessment) {
      console.log('No assessment data available, using default scores')
      assessment = {
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
    }

    console.log('Returning assessment:', JSON.stringify({ assessment }, null, 2))

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