import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: languageData, error: languageError } = await supabase
      .from('languages')
      .select('pronunciation_config')
      .eq('code', languageCode)
      .single()

    if (languageError || !languageData) {
      throw new Error(`Failed to get language config: ${languageError?.message}`)
    }

    console.log('Retrieved language config:', languageData)

    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')
    if (!speechKey || !speechRegion) {
      throw new Error('Missing Azure Speech configuration')
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    const audioData = await audioFile.arrayBuffer()
    const pushStream = sdk.AudioInputStream.createPushStream()
    
    const audioArray = new Uint8Array(audioData)
    pushStream.write(audioArray)
    pushStream.close()

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    pronunciationConfig.applyTo(recognizer)

    return new Promise((resolve) => {
      let finalResult: any = null;

      recognizer.recognized = async (s, e) => {
        if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
          const jsonResult = JSON.parse(e.result.properties.getProperty(
            sdk.PropertyId.SpeechServiceResponse_JsonResult
          ))
          
          console.log('Raw assessment result:', JSON.stringify(jsonResult))

          const scores = calculateWeightedScores(
            jsonResult,
            languageData.pronunciation_config
          )

          console.log('Recognition completed successfully with weighted scores:', scores)

          finalResult = {
            score: scores.finalScore,
            feedback: {
              phonemeAnalysis: "Detailed phoneme analysis will be provided soon",
              wordScores: jsonResult.NBest[0].Words.reduce((acc: any, word: any) => {
                acc[word.Word] = word.PronunciationAssessment.AccuracyScore;
                return acc;
              }, {}),
              suggestions: generateSuggestions(jsonResult.NBest[0].Words),
              accuracyScore: scores.accuracyScore,
              fluencyScore: scores.fluencyScore,
              completenessScore: scores.completenessScore,
              pronScore: scores.pronScore,
              words: jsonResult.NBest[0].Words
            }
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
            JSON.stringify(finalResult),
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

function generateSuggestions(words: Array<{
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: string;
  };
}>): string {
  const problematicWords = words.filter(
    word => word.PronunciationAssessment.ErrorType !== 'None'
  );

  if (problematicWords.length === 0) {
    return "Great pronunciation! Keep practicing to maintain your skills.";
  }

  const suggestions = problematicWords.map(word => {
    const { Word, PronunciationAssessment } = word;
    const { ErrorType, AccuracyScore } = PronunciationAssessment;

    switch (ErrorType.toLowerCase()) {
      case 'omission':
        return `Make sure to pronounce "${Word}" - it was missed in your recording.`;
      case 'mispronunciation':
        return `Focus on improving the pronunciation of "${Word}" (${AccuracyScore}% accuracy).`;
      default:
        return `Practice the word "${Word}" more.`;
    }
  });

  return suggestions.join(' ');
}