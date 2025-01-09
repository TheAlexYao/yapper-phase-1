import { useEffect, useState } from 'react';
import PostScenarioSummary from './PostScenarioSummary';
import { ChatMessage, Script } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';
import { ChatSessionProvider } from './chat/ChatSessionProvider';
import { ChatContent } from './chat/ChatContent';
import { createBotMessage } from '@/utils/messageUtils';

interface ScenarioChatScreenProps {
  scenarioId: string;
  scenarioTitle: string;
  topicId: string;
  characterId: string;
  characterName: string;
  selectedLanguage: LanguageCode;
  onBackToCharacters: () => void;
  script: Script | null;
}

const ScenarioChatScreen = ({
  scenarioId,
  scenarioTitle,
  characterId,
  characterName,
  selectedLanguage,
  onBackToCharacters,
  script
}: ScenarioChatScreenProps) => {
  const [scriptLines, setScriptLines] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (script) {
      const lines = script.script_data.lines.map((line, index) => ({
        id: index.toString(),
        role: line.speaker === 'character' ? 'bot' : 'user',
        text: line.targetText,
        ttsText: line.ttsText,
        transliteration: line.transliteration,
        translation: line.translation,
        tts_audio_url: line.audioUrl || '',
        user_audio_url: null,
        score: null,
        language_code: selectedLanguage,
      }));

      setScriptLines(lines);
    }
  }, [script, selectedLanguage]);

  if (!script || scriptLines.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <ChatSessionProvider scenarioId={scenarioId} characterId={characterId}>
      <ChatContent
        scenarioTitle={scenarioTitle}
        characterName={characterName}
        selectedLanguage={selectedLanguage}
        onBackToCharacters={onBackToCharacters}
        script={script}
        scriptLines={scriptLines}
      />
    </ChatSessionProvider>
  );
};

export default ScenarioChatScreen;