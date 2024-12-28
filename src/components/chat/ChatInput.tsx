import React from 'react';
import { Button } from "@/components/ui/button";
import AudioPlayer from './AudioPlayer';
import RecordingInterface from './RecordingInterface';
import { BotMessage } from '@/types/chat';

interface ChatInputProps {
  currentPrompt: BotMessage | null;
  onRecordingComplete: (audioUrl: string, score: number) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ currentPrompt, onRecordingComplete }) => {
  if (!currentPrompt) return null;

  return (
    <div className="border-t bg-white flex flex-col items-center w-full">
      <div className="p-4 w-full flex flex-col items-center">
        <h3 className="font-semibold mb-2 text-center">Your turn:</h3>
        <p className="text-sm md:text-base text-center">{currentPrompt.text}</p>
        <p className="text-xs md:text-sm text-gray-600 mt-1 text-center">{currentPrompt.transliteration}</p>
        <div className="mt-2 flex flex-col items-center gap-2">
          <AudioPlayer audioUrl={currentPrompt.tts_audio_url} label="TTS" />
          <RecordingInterface onRecordingComplete={onRecordingComplete} />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;