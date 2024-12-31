import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assessPronunciation } from './utils/pronunciationAssessor.ts'
import { mapSegmentedResultsToOriginal } from './utils/thaiTextProcessor.ts'

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
      throw new Error('Language configuration not found')
    }

    // Process audio file
    const audioData = await audioFile.arrayBuffer()
    const { result, segmentation } = await assessPronunciation(
      audioData,
      referenceText,
      languageCode,
      languageConfig.pronunciation_config
    )

    // Get assessment results
    const jsonResult = result.properties.getProperty(
      sdk.PropertyId.SpeechServiceResponse_JsonResult
    )

    console.log('Raw assessment result:', jsonResult)

    // Parse and process results
    let assessment = JSON.parse(jsonResult)
    
    // Map segmented results back to original text if needed
    if (segmentation) {
      assessment = mapSegmentedResultsToOriginal(assessment, segmentation.wordMapping)
    }

    // Apply language-specific weights
    const config = languageConfig.pronunciation_config
    if (assessment.NBest?.[0]) {
      const nBest = assessment.NBest[0]
      const weightedAccuracy = nBest.PronunciationAssessment.AccuracyScore * config.accuracyWeight
      const weightedFluency = nBest.PronunciationAssessment.FluencyScore * config.fluencyWeight
      const weightedCompleteness = nBest.PronunciationAssessment.CompletenessScore * config.completenessWeight
      
      const totalWeight = config.accuracyWeight + config.fluencyWeight + config.completenessWeight
      const weightedScore = Math.round(
        (weightedAccuracy + weightedFluency + weightedCompleteness) / totalWeight
      )

      nBest.PronunciationAssessment.AccuracyScore = Math.round(weightedAccuracy)
      nBest.PronunciationAssessment.FluencyScore = Math.round(weightedFluency)
      nBest.PronunciationAssessment.CompletenessScore = Math.round(weightedCompleteness)
      nBest.PronunciationAssessment.PronScore = weightedScore
    }

    return new Response(
      JSON.stringify({ assessment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in assess-pronunciation:', error)
    
    return new Response(
      JSON.stringify({ error: error.message, details: error.stack }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})