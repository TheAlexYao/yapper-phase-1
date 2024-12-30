import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./utils/corsHeaders.ts"
import { uploadAudioToStorage } from "./utils/audioStorage.ts"
import { performSpeechRecognition } from "./utils/speechRecognition.ts"
import { createDefaultResponse } from "./utils/assessmentResponse.ts"
import { validateAndProcessWavFile } from "./utils/audioProcessing.ts"

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

    // Upload original audio for reference
    const audioUrl = await uploadAudioToStorage(audioFile)
    console.log('Audio uploaded successfully:', audioUrl)
    
    // Process and validate WAV file
    const arrayBuffer = await audioFile.arrayBuffer()
    const { isValid, pcmData, header, error } = validateAndProcessWavFile(arrayBuffer)
    
    if (!isValid || !pcmData || !header) {
      throw new Error(`Invalid audio format: ${error}`)
    }

    // Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    // Perform pronunciation assessment
    const result = await performSpeechRecognition({
      speechKey,
      speechRegion,
      languageCode,
      referenceText,
      audioData: pcmData.buffer,
      sampleRate: header.sampleRate,
      channels: header.numChannels,
      bitsPerSample: header.bitsPerSample
    })

    // Process and format assessment results
    let assessment = result && typeof result === 'object' 
      ? extractAssessmentData(result)
      : createDefaultResponse(referenceText, audioUrl).assessment;

    return new Response(
      JSON.stringify({ audioUrl, assessment }),
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

function extractAssessmentData(result: any) {
  if (result.privJson) {
    const privJsonData = JSON.parse(result.privJson)
    console.log('Pronunciation assessment from privJson:', privJsonData)
    
    if (privJsonData.NBest && privJsonData.NBest[0]) {
      const nBestResult = privJsonData.NBest[0];
      return {
        NBest: [{
          PronunciationAssessment: nBestResult.PronunciationAssessment,
          Words: nBestResult.Words.map((word: any) => ({
            Word: word.Word,
            PronunciationAssessment: {
              AccuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
              ErrorType: word.PronunciationAssessment?.ErrorType || "None",
              Feedback: word.PronunciationAssessment?.Feedback || null
            },
            Syllables: word.Syllables || [],
            Phonemes: word.Phonemes || []
          }))
        }],
        pronunciationScore: nBestResult.PronunciationAssessment?.PronScore || 0
      }
    }
  }
  return null;
}