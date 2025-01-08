import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import { RecordingControls } from '@/components/chat/RecordingControls';
import { ChatSessionManager } from '@/components/screens/chat/ChatSessionManager';
import { ScriptManager } from '@/components/screens/chat/ScriptManager';
import PronunciationFeedbackModal from '@/components/chat/PronunciationFeedbackModal';
import { Script } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';

const ScenarioChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [script, setScript] = useState<Script | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');

  const handleBackToCharacters = () => {
    navigate('/characters');
  };

  const handleScriptLoaded = (
    scriptLines: any[],
    initialMessages: any[],
    initialLineIndex: number
  ) => {
    setScript({ script_data: { lines: scriptLines } });
    setMessages(initialMessages);
  };

  const handleRecordingComplete = (audioUrl: string, audioBlob: Blob) => {
    // Handle recording completion
    console.log('Recording completed:', { audioUrl, audioBlob });
  };

  return (
    <div>
      <ChatHeader
        characterName="Character Name" // Replace with actual character name from context/props
        scenarioTitle="Scenario Title" // Replace with actual scenario title from context/props
        onBackToCharacters={handleBackToCharacters}
      />
      <ChatMessages messages={messages} />
      <RecordingControls
        currentPrompt={currentPrompt}
        onRecordingComplete={handleRecordingComplete}
      />
      <ChatSessionManager
        scenarioId="scenario-id" // Replace with actual scenario ID from context/props
        characterId="character-id" // Replace with actual character ID from context/props
        selectedLanguage={selectedLanguage}
        script={script}
        onSessionLoaded={(sessionMessages, currentLineIndex, sessionId) => {
          setMessages(sessionMessages);
        }}
      />
      <ScriptManager
        script={script}
        selectedLanguage={selectedLanguage}
        onScriptLoaded={handleScriptLoaded}
      />
      <PronunciationFeedbackModal
        isOpen={false}
        onClose={() => {}}
        feedback={{
          overall_score: 0,
          phoneme_analysis: '',
          word_scores: {},
          suggestions: ''
        }}
      />
    </div>
  );
};

export default ScenarioChat;