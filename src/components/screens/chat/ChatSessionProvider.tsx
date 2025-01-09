import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from '@/types/chat';

interface ChatSessionContextType {
  sessionId: string | null;
  messages: ChatMessage[];
  currentLineIndex: number;
  updateSession: (messages: ChatMessage[], lineIndex: number) => Promise<void>;
}

const ChatSessionContext = createContext<ChatSessionContextType | null>(null);

export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
};

interface ChatSessionProviderProps {
  scenarioId: string;
  characterId: string;
  children: React.ReactNode;
}

export const ChatSessionProvider = ({ scenarioId, characterId, children }: ChatSessionProviderProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // First try to find an existing session
        const { data: existingSessions, error: queryError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('character_id', characterId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (queryError) {
          console.error('Error fetching session:', queryError);
          return;
        }

        if (existingSessions) {
          console.log('Found existing session:', existingSessions);
          setSessionId(existingSessions.id);
          setMessages(existingSessions.messages as ChatMessage[]);
          setCurrentLineIndex(existingSessions.current_line_index);
        } else {
          // Create a new session if none exists
          const { data: newSession, error: insertError } = await supabase
            .from('chat_sessions')
            .insert({
              scenario_id: scenarioId,
              character_id: characterId,
              user_id: user.id,
              messages: [],
              current_line_index: 0
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating session:', insertError);
            return;
          }

          if (newSession) {
            console.log('Created new session:', newSession);
            setSessionId(newSession.id);
          }
        }
      } catch (error) {
        console.error('Error managing chat session:', error);
      }
    };

    initializeSession();
  }, [scenarioId, characterId]);

  const updateSession = async (newMessages: ChatMessage[], newLineIndex: number) => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({
          messages: newMessages,
          current_line_index: newLineIndex,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setMessages(newMessages);
      setCurrentLineIndex(newLineIndex);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  return (
    <ChatSessionContext.Provider value={{ sessionId, messages, currentLineIndex, updateSession }}>
      {children}
    </ChatSessionContext.Provider>
  );
};