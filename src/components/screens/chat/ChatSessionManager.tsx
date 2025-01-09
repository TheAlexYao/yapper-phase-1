import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Script, ChatMessage } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';

interface ChatSessionManagerProps {
  scenarioId: string;
  characterId: string;
  selectedLanguage: LanguageCode;
  script: Script | null;
  onSessionLoaded: (messages: ChatMessage[], currentLineIndex: number, sessionId: string) => void;
}

export const ChatSessionManager: React.FC<ChatSessionManagerProps> = ({
  scenarioId,
  characterId,
  selectedLanguage,
  script,
  onSessionLoaded,
}) => {
  useEffect(() => {
    const loadExistingSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('Checking for existing chat session...');
        
        // First, check if a session exists
        const { data: existingSessions, error: queryError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('character_id', characterId)
          .eq('user_id', user.id);

        if (queryError) throw queryError;

        // If we found existing sessions, use the most recent one
        if (existingSessions && existingSessions.length > 0) {
          console.log(`Found ${existingSessions.length} existing sessions, using most recent`);
          const mostRecentSession = existingSessions.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          
          onSessionLoaded(
            mostRecentSession.messages as ChatMessage[], 
            mostRecentSession.current_line_index || 0,
            mostRecentSession.id
          );
          return;
        }

        // If no session exists, create a new one
        console.log('No existing session found, creating new one');
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

        if (insertError) throw insertError;

        if (newSession) {
          console.log('Created new chat session:', newSession);
          onSessionLoaded([], 0, newSession.id);
        }
      } catch (error) {
        console.error('Error managing chat session:', error);
      }
    };

    loadExistingSession();
  }, [scenarioId, characterId, onSessionLoaded]);

  return null;
};