import { LanguageCode } from '@/constants/languages';
import { Json } from '@/types/json';

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  ttsText: string;
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
  targetText: string;
  ttsText: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
  lineNumber?: number;
}

export interface ScriptData {
  lines: ScriptLine[];
  languageCode: string;
}

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
  if (!data || typeof data !== 'object') {
    console.log('Data is not an object:', data);
    return false;
  }
  
  const scriptData = data as Partial<ScriptData>;
  
  if (!Array.isArray(scriptData.lines)) {
    console.log('Lines is not an array:', scriptData.lines);
    return false;
  }

  if (typeof scriptData.languageCode !== 'string') {
    console.log('LanguageCode is not a string:', scriptData.languageCode);
    return false;
  }
  
  return scriptData.lines.every(line => {
    const isValid = typeof line === 'object' &&
      (line.speaker === 'character' || line.speaker === 'user') &&
      typeof line.targetText === 'string' &&
      typeof line.ttsText === 'string' &&
      typeof line.translation === 'string' &&
      typeof line.transliteration === 'string';

    if (!isValid) {
      console.log('Invalid line:', line);
      console.log('Line validation:', {
        isObject: typeof line === 'object',
        hasValidSpeaker: line.speaker === 'character' || line.speaker === 'user',
        hasTargetText: typeof line.targetText === 'string',
        hasTtsText: typeof line.ttsText === 'string',
        hasTranslation: typeof line.translation === 'string',
        hasTransliteration: typeof line.transliteration === 'string'
      });
    }

    return isValid;
  });
}