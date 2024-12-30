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
    console.log('Starting pronunciation assessment...')
    const formData = await req.formData()
    const audioFile = formData.get('audio')
    const referenceText = formData.get('text')
    const languageCode = formData.get('languageCode')

    console.log('Received request:', {
      hasAudio: !!audioFile,
      referenceText,
      languageCode,
      audioType: audioFile?.type,
      audioSize: audioFile?.size
    })

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    // Upload audio file to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `recordings/${crypto.randomUUID()}.wav`
    
    console.log('Uploading audio file to storage...')
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

    // Get public URL for the uploaded audio
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    console.log('Audio file uploaded successfully:', publicUrl)

    // Configure Azure Speech Service
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      Deno.env.get('AZURE_SPEECH_KEY') ?? '',
      Deno.env.get('AZURE_SPEECH_REGION') ?? ''
    )
    speechConfig.speechRecognitionLanguage = languageCode

    // Convert audio file to ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer()
    
    // Create a Push Stream for the audio data
    const pushStream = sdk.AudioInputStream.createPushStream()
    
    // Write the WAV file data to the push stream
    pushStream.write(new Uint8Array(arrayBuffer))
    pushStream.close()

    // Create audio config from push stream
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

    // Create recognizer and configure pronunciation assessment
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    
    // Configure pronunciation assessment
    const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )
    
    pronunciationAssessmentConfig.applyTo(recognizer)

    // Perform recognition and assessment
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          console.log('Assessment completed:', result)
          if (result.errorDetails) {
            reject(new Error(result.errorDetails))
            return
          }
          resolve(result)
        },
        error => reject(error)
      )
    })

    // Extract assessment data
    const assessment = extractAssessmentData(result)
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

// Helper function to extract assessment data
function extractAssessmentData(result: any) {
  try {
    if (!result.privJson) {
      throw new Error('No assessment data available')
    }

    const data = JSON.parse(result.privJson)
    console.log('Raw assessment data:', data)

    if (!data.NBest || !data.NBest[0]) {
      throw new Error('Invalid assessment data structure')
    }

    const nBestResult = data.NBest[0]
    return {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: nBestResult.PronunciationAssessment?.AccuracyScore || 0,
          FluencyScore: nBestResult.PronunciationAssessment?.FluencyScore || 0,
          CompletenessScore: nBestResult.PronunciationAssessment?.CompletenessScore || 0,
          PronScore: nBestResult.PronunciationAssessment?.PronScore || 0
        },
        Words: nBestResult.Words?.map((word: any) => ({
          Word: word.Word,
          PronunciationAssessment: {
            AccuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
            ErrorType: word.PronunciationAssessment?.ErrorType || "None"
          }
        })) || []
      }],
      pronunciationScore: nBestResult.PronunciationAssessment?.PronScore || 0
    }
  } catch (error) {
    console.error('Error extracting assessment data:', error)
    return {
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
}