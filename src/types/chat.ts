export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  transliteration: string | null;
  translation: string;
  tts_audio_url: string;
  user_audio_url: string | null;
  score: number | null;
  feedback?: {
    overall_score: number;
    phoneme_analysis: string;
    word_scores: { [word: string]: number };
    suggestions: string;
    NBest?: Array<{
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
  };
}

export interface BotMessage extends ChatMessage {
  role: 'bot';
}

export interface UserMessage extends ChatMessage {
  role: 'user';
  feedback: NonNullable<ChatMessage['feedback']>;
}