import { useEffect } from 'react';
import { ChatMessage, Script } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';

interface ScriptManagerProps {
  script: Script | null;
  selectedLanguage: LanguageCode;
  onScriptLoaded: (scriptLines: ChatMessage[], initialMessages: ChatMessage[], initialLineIndex: number) => void;
}

export const ScriptManager: React.FC<ScriptManagerProps> = ({
  script,
  selectedLanguage,
  onScriptLoaded,
}) => {
  useEffect(() => {
    if (script) {
      const initialScriptLines: ChatMessage[] = script.script_data.lines.map((line, index) => ({
        id: `${index}`,
        role: line.speaker === 'character' ? 'bot' : 'user',
        text: line.targetText,
        transliteration: line.transliteration,
        translation: line.translation,
        tts_audio_url: line.audioUrl || '',
        user_audio_url: null,
        score: null,
        language_code: selectedLanguage
      }));

      const initialMessages: ChatMessage[] = initialScriptLines[0]?.role === 'bot' 
        ? [initialScriptLines[0]] 
        : [];

      const initialLineIndex = initialMessages.length ? 1 : 0;

      onScriptLoaded(initialScriptLines, initialMessages, initialLineIndex);
    }
  }, [script, selectedLanguage, onScriptLoaded]);

  return null;
};