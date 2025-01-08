import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import { RecordingControls } from '@/components/chat/RecordingControls';
import { ChatSessionManager } from '@/components/screens/chat/ChatSessionManager';
import { ScriptManager } from '@/components/screens/chat/ScriptManager';
import { PronunciationFeedbackModal } from '@/components/chat/PronunciationFeedbackModal';

const ScenarioChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div>
      <ChatHeader />
      <ChatMessages />
      <RecordingControls
        isRecording={isRecording}
        onStart={handleStartRecording}
        onStop={handleStopRecording}
      />
      <ChatSessionManager sessionId={sessionId} />
      <ScriptManager />
      <PronunciationFeedbackModal />
    </div>
  );
};

export default ScenarioChat;
