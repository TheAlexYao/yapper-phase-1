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
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    console.log('Starting pronunciation assessment...')

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

    // Create audio config from the WAV file
    const audioData = await audioFile.arrayBuffer()
    const pushStream = sdk.AudioInputStream.createPushStream()
    
    // Write audio data in chunks
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
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizing = (s, e) => {
        console.log('Recognition in progress:', e.result.text)
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

    console.log('Recognition completed successfully')

    return new Response(
      JSON.stringify({ assessment: JSON.parse(jsonResult) }),
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