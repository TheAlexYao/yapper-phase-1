import React from 'react';
import { useSession } from './SessionProvider';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import { RecordingControls } from '@/components/chat/RecordingControls';
import { BotMessage } from '@/types/chat';

interface ScenarioContentProps {
  characterName: string;
  scenarioTitle: string;
  onBackToCharacters: () => void;
  currentPrompt: BotMessage | null;
  onRecordingComplete: (audioUrl: string, audioBlob: Blob) => Promise<void>;
}

const ScenarioContent: React.FC<ScenarioContentProps> = ({
  characterName,
  scenarioTitle,
  onBackToCharacters,
  currentPrompt,
  onRecordingComplete,
}) => {
  const { messages } = useSession();

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift"></div>
      </div>

      <div className="relative z-20 flex flex-col h-full">
        <ChatHeader
          characterName={characterName}
          scenarioTitle={scenarioTitle}
          onBackToCharacters={onBackToCharacters}
        />

        <ChatMessages messages={messages} />

        <RecordingControls
          currentPrompt={currentPrompt}
          onRecordingComplete={onRecordingComplete}
        />
      </div>
    </div>
  );
};

export default ScenarioContent;