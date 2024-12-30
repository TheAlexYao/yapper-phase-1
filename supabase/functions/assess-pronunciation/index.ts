import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
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

    // Upload audio file to storage
    const fileName = `recordings/${crypto.randomUUID()}.wav`
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioFile, {
        contentType: 'audio/wav',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading audio:', uploadError)
      throw new Error('Failed to upload audio file')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    console.log('Audio uploaded successfully:', publicUrl)

    // Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    // Configure Azure Speech Services
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create a push stream for the audio data
    const pushStream = sdk.AudioInputStream.createPushStream()
    
    // Get audio data and write to stream
    const arrayBuffer = await audioFile.arrayBuffer()
    pushStream.write(new Uint8Array(arrayBuffer))
    pushStream.close()

    // Create audio config from push stream
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

    // Create recognizer
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

    // Configure pronunciation assessment
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )

    pronunciationConfig.applyTo(recognizer)

    // Perform recognition and assessment
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          console.log('Assessment completed:', result)
          resolve(result)
        },
        error => reject(error)
      )
    })

    // Extract assessment data
    let assessment = null
    if (result && result.privJson) {
      try {
        const jsonData = JSON.parse(result.privJson)
        console.log('Raw assessment data:', jsonData)
        
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
                Offset: word.Offset,
                Duration: word.Duration,
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
      }
    }

    if (!assessment) {
      assessment = {
        NBest: [{
          PronunciationAssessment: {
            AccuracyScore: 0,
            FluencyScore: 0,
            CompletenessScore: 0,
            PronScore: 0
          },
          Words: []
        }],
        pronunciationScore: 0
      }
    }

    console.log('Returning assessment:', { publicUrl, assessment })

    return new Response(
      JSON.stringify({ audioUrl: publicUrl, assessment }),
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