import ScriptGenerator from '@/components/chat/ScriptGenerator';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import RecordingControls from '@/components/chat/RecordingControls';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChatMessage } from '@/types/chat';

const ScenarioChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const characterName = location.state?.characterName || 'Character';
  const scenarioTitle = location.state?.scenarioTitle || 'Scenario';

  const handleBackToCharacters = () => {
    navigate('/characters');
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    // Simulated delay for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader
        characterName={characterName}
        scenarioTitle={scenarioTitle}
        onBackToCharacters={handleBackToCharacters}
      />
      <ScriptGenerator />
      <ChatMessages messages={messages} />
      <RecordingControls
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        disabled={isProcessing}
      />
    </div>
  );
};

export default ScenarioChat;