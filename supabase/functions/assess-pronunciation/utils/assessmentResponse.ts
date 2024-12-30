interface DefaultResponse {
  audioUrl: string;
  assessment: {
    NBest: Array<{
      PronunciationAssessment: {
        AccuracyScore: number;
        FluencyScore: number;
        CompletenessScore: number;
        PronScore: number;
      };
      Words: Array<{
        Word: string;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
    }>;
    pronunciationScore: number;
  };
}

export function createDefaultResponse(text: string, audioUrl: string): DefaultResponse {
  const words = text.split(' ').map(word => ({
    Word: word,
    PronunciationAssessment: {
      AccuracyScore: 0,
      ErrorType: "NoAssessment"
    }
  }));

  return {
    audioUrl,
    assessment: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 0,
          FluencyScore: 0,
          CompletenessScore: 0,
          PronScore: 0
        },
        Words: words
      }],
      pronunciationScore: 0
    }
  };
}