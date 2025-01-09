import React, { createContext, useContext, useState } from 'react';
import { ChatMessage } from '@/types/chat';

interface SessionContextType {
  sessionId: string | null;
  messages: ChatMessage[];
  currentLineIndex: number;
  setSessionId: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setCurrentLineIndex: (index: number) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        messages,
        currentLineIndex,
        setSessionId,
        setMessages,
        setCurrentLineIndex,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};