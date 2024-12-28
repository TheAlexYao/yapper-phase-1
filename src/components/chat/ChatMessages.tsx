import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatBubble from './ChatBubble';
import { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, chatEndRef }) => {
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