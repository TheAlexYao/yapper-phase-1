import { supabase } from "@/integrations/supabase/client";

export const assessPronunciation = async (audioBlob: Blob, text: string): Promise<{
  score: number;
  feedback: {
    phonemeAnalysis: string;
    wordScores: { [word: string]: number };
    suggestions: string;
    accuracyScore: number;
    fluencyScore: number;
    completenessScore: number;
    words: Array<{
      Word: string;
      Offset?: number;
      Duration?: number;
      PronunciationAssessment: {
        AccuracyScore: number;
        ErrorType: string;
      };
    }>;
  };
}> => {
  try {
    console.log('Starting pronunciation assessment for text:', text);
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('text', text);
    formData.append('languageCode', 'es-ES');

    const { data, error } = await supabase.functions.invoke('assess-pronunciation', {
      body: formData,
    });

    if (error) {
      console.error('Error from assess-pronunciation function:', error);
      throw error;
    }

    console.log('Received assessment data:', JSON.stringify(data, null, 2));

    if (!data.assessment?.NBest?.[0]) {
      console.error('Invalid assessment data structure:', data);
      throw new Error('Invalid assessment response structure');
    }

    const nBestResult = data.assessment.NBest[0];
    const pronunciationScore = data.assessment.pronunciationScore * 100; // Convert to percentage

    // Create word scores object
    const wordScores: { [word: string]: number } = {};
    nBestResult.Words.forEach(word => {
      wordScores[word.Word] = word.PronunciationAssessment.AccuracyScore;
    });

    return {
      score: pronunciationScore,
      feedback: {
        phonemeAnalysis: "Detailed phoneme analysis will be provided soon",
        wordScores,
        suggestions: "Practice speaking more slowly and clearly",
        accuracyScore: nBestResult.PronunciationAssessment.AccuracyScore,
        fluencyScore: nBestResult.PronunciationAssessment.FluencyScore,
        completenessScore: nBestResult.PronunciationAssessment.CompletenessScore,
        words: nBestResult.Words
      }
    };
  } catch (error) {
    console.error('Error in assessPronunciation:', error);
    throw error;
  }
};