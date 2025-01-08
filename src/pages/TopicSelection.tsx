import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LanguageCode } from "@/constants/languages";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const TopicSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user's preferred language on component mount
  useEffect(() => {
    const fetchUserLanguage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('target_language')
          .eq('id', session.user.id)
          .single();

        if (profile?.target_language) {
          queryClient.setQueryData(['selectedLanguage'], profile.target_language);
        }
      }
    };

    fetchUserLanguage();
  }, [queryClient]);

  const handleTopicSelect = async (topicTitle: string) => {
    const [title, lang] = topicTitle.split('?lang=');
    
    // Store both topic and language in React Query cache
    queryClient.setQueryData(['selectedTopic'], { title });
    queryClient.setQueryData(['selectedLanguage'], lang as LanguageCode);

    // Also update user's profile with the selected language
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ target_language: lang })
        .eq('id', session.user.id);
    }
    
    navigate('/scenarios');
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;