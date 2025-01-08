import { LanguageCode } from '@/constants/languages';
import { Json } from '@/types/json';

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
        finalScore: number;
        weightedAccuracyScore?: number;
        weightedFluencyScore?: number;
        weightedCompletenessScore?: number;
        pronScore?: number;
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
  [key: string]: Json | undefined;
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
  audioUrl: string;
  lineNumber: number;
  targetText: string;
  ttsText: string; // Added for TTS-specific formatting
  translation: string;
  transliteration: string;
}

// This interface matches our database JSONB structure
export interface ScriptData {
  lines: ScriptLine[];
  languageCode: string;
}

// This type ensures the Script interface matches our database structure
export interface Script {
  id: string;
  language_code: string;
  scenario_id: string;
  character_id: string;
  user_gender: 'male' | 'female';
  script_data: ScriptData;
  created_at?: string;
  updated_at?: string;
  audio_generated?: boolean;
}

// Type guard to validate ScriptData structure
export function isValidScriptData(data: unknown): data is ScriptData {
  if (!data || typeof data !== 'object') return false;
  
  const scriptData = data as Partial<ScriptData>;
  
  if (!Array.isArray(scriptData.lines)) return false;
  if (typeof scriptData.languageCode !== 'string') return false;
  
  return scriptData.lines.every(line => 
    typeof line === 'object' &&
    (line.speaker === 'character' || line.speaker === 'user') &&
    typeof line.audioUrl === 'string' &&
    typeof line.lineNumber === 'number' &&
    typeof line.targetText === 'string' &&
    typeof line.ttsText === 'string' &&
    typeof line.translation === 'string' &&
    typeof line.transliteration === 'string'
  );
}