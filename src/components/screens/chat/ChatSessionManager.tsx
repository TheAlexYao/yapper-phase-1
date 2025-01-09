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

        // Use maybeSingle() instead of single() to handle multiple results
        const { data: session, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('character_id', characterId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })  // Get the most recent session
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (session) {
          console.log('Loaded existing chat session:', session);
          onSessionLoaded(
            session.messages as ChatMessage[], 
            session.current_line_index || 0,
            session.id
          );
        } else {
          console.log('Creating new chat session');
          // Create new session
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
        }
      } catch (error) {
        console.error('Error loading chat session:', error);
      }
    };

    loadExistingSession();
  }, [scenarioId, characterId, onSessionLoaded]);

  return null;
};