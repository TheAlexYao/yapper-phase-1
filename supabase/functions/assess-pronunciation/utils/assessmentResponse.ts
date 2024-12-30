export interface WordAssessment {
  Word: string;
  Offset?: number;
  Duration?: number;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: string;
  };
}

export interface PronunciationAssessment {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronScore: number;
}

export interface NBestResult {
  PronunciationAssessment: PronunciationAssessment;
  Words: WordAssessment[];
}

export const transformAssessmentResponse = (rawAssessment: any) => {
  // Ensure we have the NBest array
  if (!rawAssessment.NBest?.[0]) {
    throw new Error('Invalid assessment response structure');
  }

  const nBest = rawAssessment.NBest[0];
  
  // Map each word maintaining all properties
  const words = nBest.Words.map((word: any) => ({
    Word: word.Word,
    Offset: word.Offset,
    Duration: word.Duration,
    PronunciationAssessment: {
      AccuracyScore: word.PronunciationAssessment.AccuracyScore,
      ErrorType: word.PronunciationAssessment.ErrorType
    }
  }));

  return {
    NBest: [{
      PronunciationAssessment: {
        AccuracyScore: nBest.PronunciationAssessment.AccuracyScore,
        FluencyScore: nBest.PronunciationAssessment.FluencyScore,
        CompletenessScore: nBest.PronunciationAssessment.CompletenessScore,
        PronScore: nBest.PronunciationAssessment.PronScore
      },
      Words: words
    }],
    pronunciationScore: nBest.PronunciationAssessment.PronScore
  };
};