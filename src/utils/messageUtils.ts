import { BotMessage, UserMessage } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';

export const createBotMessage = ({
  id,
  text,
  ttsText,
  transliteration,
  translation,
  tts_audio_url,
  language_code,
}: {
  id: string;
  text: string;
  ttsText: string;
  transliteration: string | null;
  translation: string;
  tts_audio_url: string;
  language_code: LanguageCode;
}): BotMessage => ({
  id,
  role: 'bot',
  text,
  ttsText,
  transliteration,
  translation,
  tts_audio_url,
  user_audio_url: null,
  score: null,
  language_code,
});

export const createUserMessage = ({
  id,
  text,
  ttsText,
  transliteration,
  translation,
  tts_audio_url,
  user_audio_url,
  score,
  language_code,
  feedback,
}: {
  id: string;
  text: string;
  ttsText: string;
  transliteration: string | null;
  translation: string;
  tts_audio_url: string;
  user_audio_url: string;
  score: number;
  language_code: LanguageCode;
  feedback: NonNullable<UserMessage['feedback']>;
}): UserMessage => ({
  id,
  role: 'user',
  text,
  ttsText,
  transliteration,
  translation,
  tts_audio_url,
  user_audio_url,
  score,
  language_code,
  feedback,
});