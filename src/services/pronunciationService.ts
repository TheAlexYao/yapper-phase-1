import { supabase } from "@/integrations/supabase/client";

export const assessPronunciation = async (audioBlob: Blob, text: string, languageCode: string): Promise<{
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
    console.log('Using language code:', languageCode);
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('text', text);
    formData.append('languageCode', languageCode);

    const { data, error } = await supabase.functions.invoke('assess-pronunciation', {
      body: formData,
    });

    if (error) {
      console.error('Error from assess-pronunciation function:', error);
      throw error;
    }

    console.log('Raw assessment data received:', JSON.stringify(data, null, 2));

    if (!data.assessment?.NBest?.[0]) {
      console.error('Invalid assessment data structure:', data);
      throw new Error('Invalid assessment response structure');
    }

    const nBestResult = data.assessment.NBest[0];
    const finalScore = data.assessment.finalScore || data.assessment.pronunciationScore;

    console.log('Processing NBest result:', JSON.stringify(nBestResult, null, 2));
    console.log('Words data:', JSON.stringify(nBestResult.Words, null, 2));
    console.log('Final score:', finalScore);

    // Create word scores object
    const wordScores: { [word: string]: number } = {};
    nBestResult.Words.forEach(word => {
      wordScores[word.Word] = word.PronunciationAssessment.AccuracyScore;
      console.log(`Word score for "${word.Word}":`, word.PronunciationAssessment.AccuracyScore);
    });

    // Generate suggestions based on word scores
    const suggestions = generateSuggestions(nBestResult.Words);

    console.log('Final processed feedback:', {
      score: finalScore,
      accuracyScore: nBestResult.PronunciationAssessment.AccuracyScore,
      fluencyScore: nBestResult.PronunciationAssessment.FluencyScore,
      completenessScore: nBestResult.PronunciationAssessment.CompletenessScore,
      wordScores,
      suggestions,
      words: nBestResult.Words
    });

    return {
      score: finalScore,
      feedback: {
        phonemeAnalysis: "Detailed phoneme analysis will be provided soon",
        wordScores,
        suggestions,
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