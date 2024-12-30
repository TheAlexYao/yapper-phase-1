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
  // Mock implementation for now - replace with actual API call
  return {
    score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
    feedback: {
      phonemeAnalysis: "Good pronunciation of most sounds",
      wordScores: { [text]: 80 },
      suggestions: "Try to speak a bit more slowly",
      accuracyScore: 85,
      fluencyScore: 80,
      completenessScore: 90,
      words: [{
        Word: text,
        Offset: 0,
        Duration: 1000,
        PronunciationAssessment: {
          AccuracyScore: 85,
          ErrorType: "None"
        }
      }]
    }
  };
};