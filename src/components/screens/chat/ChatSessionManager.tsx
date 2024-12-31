import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage, Script } from '@/types/chat';
import { LanguageCode } from '@/constants/languages';

interface ChatSessionManagerProps {
  scenarioId: number;
  characterId: number;
  selectedLanguage: LanguageCode;
  script: Script | null;
  onSessionLoaded: (messages: ChatMessage[], currentLineIndex: number) => void;
}

export const ChatSessionManager: React.FC<ChatSessionManagerProps> = ({
  scenarioId,
  characterId,
  selectedLanguage,
  script,
  onSessionLoaded,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadOrCreateSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to use this feature",
            variant: "destructive"
          });
          return;
        }

        const { data: existingSessions, error: fetchError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (existingSessions && existingSessions.length > 0) {
          const session = existingSessions[0];
          setSessionId(session.id);
          onSessionLoaded(session.messages || [], session.current_line_index || 0);
        } else {
          const { data: newSession, error: createError } = await supabase
            .from('chat_sessions')
            .insert([{
              scenario_id: scenarioId,
              character_id: characterId,
              user_id: user.id,
              messages: [],
              current_line_index: 0
            }])
            .select()
            .single();

          if (createError) throw createError;
          if (newSession) {
            setSessionId(newSession.id);
            onSessionLoaded([], 0);
          }
        }
      } catch (error) {
        console.error('Error managing session:', error);
        toast({
          title: "Error",
          description: "Failed to load or create chat session",
          variant: "destructive"
        });
      }
    };

    if (script) {
      loadOrCreateSession();
    }
  }, [script, scenarioId, characterId, onSessionLoaded, toast]);

  return null;
};