import { LanguageCode } from '@/constants/languages';
import { Json } from '@/integrations/supabase/types';

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  transliteration: string | null;
  translation: string;
  tts_audio_url: string;
  user_audio_url: string | null;
  score: number | null;
  language_code: LanguageCode;
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
        Offset?: number;
        Duration?: number;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
    }>;
  };
  [key: string]: Json | undefined; // Add index signature to make it compatible with Json type
}

export interface BotMessage extends ChatMessage {
  role: 'bot';
}

export interface UserMessage extends ChatMessage {
  role: 'user';
  feedback: NonNullable<ChatMessage['feedback']>;
}

export interface ScriptLine {
  speaker: 'character' | 'user';
  targetText: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
}

export interface Script {
  script_data: {
    lines: ScriptLine[];
    languageCode: string;
  };
}