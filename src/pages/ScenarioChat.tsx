import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import ScenarioChatScreen from "@/components/screens/ScenarioChatScreen";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { LanguageCode } from "@/constants/languages";

type ScriptRow = Database['public']['Tables']['scripts']['Row'];
type UserGender = 'male' | 'female';

const ScenarioChat = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const selectedScenario = queryClient.getQueryData(['selectedScenario']) as { 
    id: string;
    title: string;
    topicId: string;
  } | undefined;
  
  const selectedCharacter = queryClient.getQueryData(['selectedCharacter']) as { 
    id: string;
    name: string 
  } | undefined;

  const selectedLanguage = (queryClient.getQueryData(['selectedLanguage']) as LanguageCode) || "en-US";
  const userGender = (queryClient.getQueryData(['userGender']) as UserGender) || "male";

  // Query for the script
  const { data: script, isLoading: isLoadingScript } = useQuery({
    queryKey: ['script', selectedScenario?.id, selectedCharacter?.id, selectedLanguage, userGender],
    queryFn: async () => {
      if (!selectedScenario || !selectedCharacter) return null;

      console.log('Fetching script with params:', {
        language_code: selectedLanguage,
        scenario_id: parseInt(selectedScenario.id),
        topic_id: parseInt(selectedScenario.topicId),
        character_id: parseInt(selectedCharacter.id),
        user_gender: userGender
      });

      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('language_code', selectedLanguage)
        .eq('scenario_id', parseInt(selectedScenario.id))
        .eq('topic_id', parseInt(selectedScenario.topicId))
        .eq('character_id', parseInt(selectedCharacter.id))
        .eq('user_gender', userGender)
        .maybeSingle();

      if (error) {
        console.error('Error fetching script:', error);
        throw error;
      }

      if (!data) {
        console.log('No script found for the given parameters');
        return null;
      }

      const transformedScript = {
        ...data,
        script_data: typeof data.script_data === 'string' 
          ? JSON.parse(data.script_data) 
          : data.script_data
      };

      console.log('Found script:', transformedScript);
      return transformedScript;
    },
    enabled: !!selectedScenario && !!selectedCharacter,
  });

  const handleBackToCharacters = () => {
    queryClient.removeQueries({ queryKey: ['selectedCharacter'] });
    navigate('/characters');
  };

  if (!selectedScenario || !selectedCharacter) {
    navigate('/topics');
    return null;
  }

  if (isLoadingScript) {
    return <div>Loading script...</div>;
  }

  return (
    <ScenarioChatScreen
      scenarioId={parseInt(selectedScenario.id)}
      scenarioTitle={selectedScenario.title}
      topicId={parseInt(selectedScenario.topicId)}
      characterId={parseInt(selectedCharacter.id)}
      characterName={selectedCharacter.name}
      selectedLanguage={selectedLanguage}
      onBackToCharacters={handleBackToCharacters}
      script={script}
    />
  );
};

export default ScenarioChat;