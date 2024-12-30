import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types/chat';
import ChatBubble from './ChatBubble';
import { useEffect, useRef } from 'react';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-white/80">
      <AnimatePresence>
        {messages.map(message => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </AnimatePresence>
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatMessages;