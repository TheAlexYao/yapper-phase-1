import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        <p className="mb-1">{message.text}</p>
        {message.transliteration && (
          <p className="text-sm opacity-80">{message.transliteration}</p>
        )}
        {message.translation && (
          <p className="text-sm opacity-80 mt-1">{message.translation}</p>
        )}
        {message.score !== null && (
          <p className="text-sm mt-2">Score: {message.score}</p>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;