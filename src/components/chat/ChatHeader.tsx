import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface ChatHeaderProps {
  characterName: string;
  scenarioTitle: string;
  onBackToCharacters: () => void;
}

const ChatHeader = ({ characterName, scenarioTitle, onBackToCharacters }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-600 hover:text-gray-800 hover:bg-opacity-80 transition-colors duration-200"
        onClick={onBackToCharacters}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-xl font-bold text-center flex-grow">
        Chat with {characterName}: {scenarioTitle}
      </h1>
      <div className="w-10"></div>
    </div>
  );
};

export default ChatHeader;