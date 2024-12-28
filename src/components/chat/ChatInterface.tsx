import React from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
  characterName: string;
  scenarioTitle: string;
  messages: ChatMessage[];
  currentPrompt: ChatMessage | null;
  isConversationComplete: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onBackToCharacters: () => void;
  onRecordingComplete: (audioUrl: string, score: number) => void;
  onShowSummary: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  characterName,
  scenarioTitle,
  messages,
  currentPrompt,
  isConversationComplete,
  chatEndRef,
  onBackToCharacters,
  onRecordingComplete,
  onShowSummary,
}) => {
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

        <ChatMessages messages={messages} chatEndRef={chatEndRef} />

        {isConversationComplete ? (
          <div className="fixed inset-x-0 bottom-0 bg-white border-t p-4 flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold text-center">Conversation Complete!</h3>
            <p className="text-center text-gray-600">Great job! You've completed this conversation scenario.</p>
            <button
              onClick={onShowSummary}
              className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              View Summary
            </button>
          </div>
        ) : (
          <ChatInput
            currentPrompt={currentPrompt}
            onRecordingComplete={onRecordingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ChatInterface;