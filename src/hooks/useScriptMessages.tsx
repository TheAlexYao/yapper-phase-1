import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from '@/types/chat';

export const useScriptMessages = (scenarioId: string, selectedLanguage: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<ChatMessage | null>(null);
  const [scriptMessages, setScriptMessages] = useState<any[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScriptMessages = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching script messages for:', { scenarioId, selectedLanguage });
        
        // Get the script template for this scenario and language through cities
        const { data: template, error: templateError } = await supabase
          .from('script_templates')
          .select(`
            id,
            city_id,
            cities!inner (
              language_id,
              languages!inner (
                code
              )
            )
          `)
          .eq('scenario_id', scenarioId)
          .eq('cities.languages.code', selectedLanguage)
          .maybeSingle();

        if (templateError) {
          console.error('Error fetching script template:', templateError);
          toast({
            title: "Error",
            description: "Failed to load conversation script. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!template) {
          console.error('No script template found for:', { scenarioId, selectedLanguage });
          toast({
            title: "Not Available",
            description: "This conversation is not yet available in the selected language. Please try another language.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        console.log('Found template:', template);

        // Get all messages for this template, ordered by line number
        const { data: scriptMsgs, error: messagesError } = await supabase
          .from('script_messages')
          .select('*')
          .eq('script_template_id', template.id)
          .order('line_number', { ascending: true });

        if (messagesError) {
          console.error('Error fetching script messages:', messagesError);
          toast({
            title: "Error",
            description: "Failed to load conversation messages. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!scriptMsgs || scriptMsgs.length === 0) {
          console.error('No messages found for template:', template.id);
          toast({
            title: "No Content",
            description: "No conversation content is available for this scenario yet.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        console.log('Found messages:', scriptMsgs);
        setScriptMessages(scriptMsgs);
        
        // Set up initial messages
        if (scriptMsgs.length > 0) {
          const firstMessage = scriptMsgs[0];
          setMessages([{
            id: '1',
            role: 'bot',
            text: firstMessage.content,
            transliteration: firstMessage.transliteration,
            translation: firstMessage.translation,
            tts_audio_url: firstMessage.audio_url || '/audio/welcome.mp3',
            user_audio_url: null,
            score: null,
          }]);
          
          if (scriptMsgs[1]) {
            setCurrentPrompt({
              id: '2',
              role: 'bot',
              text: scriptMsgs[1].content,
              transliteration: scriptMsgs[1].transliteration,
              translation: scriptMsgs[1].translation,
              tts_audio_url: scriptMsgs[1].audio_url || '/audio/user-prompt.mp3',
              user_audio_url: null,
              score: null,
            });
          }
          setCurrentMessageIndex(1);
        }
      } catch (error) {
        console.error('Error in fetchScriptMessages:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScriptMessages();
  }, [scenarioId, selectedLanguage, toast]);

  return {
    messages,
    setMessages,
    currentPrompt,
    setCurrentPrompt,
    scriptMessages,
    currentMessageIndex,
    setCurrentMessageIndex,
    isLoading,
    isConversationComplete,
    setIsConversationComplete
  };
};