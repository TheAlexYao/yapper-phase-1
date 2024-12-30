import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import ScenarioChatScreen from "@/components/screens/ScenarioChatScreen";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ScriptRow = Database['public']['Tables']['scripts']['Row'];

const ScenarioChat = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const selectedScenario = queryClient.getQueryData(['selectedScenario']) as { 
    id: number; 
    title: string;
    topicId: number;
  } | undefined;
  
  const selectedCharacter = queryClient.getQueryData(['selectedCharacter']) as { 
    id: number; 
    name: string 
  } | undefined;

  const selectedLanguage = "en"; // TODO: This should be tracked through the app flow
  const userGender = "male"; // TODO: This should be configurable by the user

  // Query for the script
  const { data: script, isLoading: isLoadingScript } = useQuery({
    queryKey: ['script', selectedScenario?.id, selectedCharacter?.id, selectedLanguage],
    queryFn: async () => {
      if (!selectedScenario || !selectedCharacter) return null;

      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('language_code', selectedLanguage)
        .eq('scenario_id', selectedScenario.id)
        .eq('topic_id', selectedScenario.topicId)
        .eq('character_id', selectedCharacter.id)
        .eq('user_gender', userGender)
        .maybeSingle();

      if (error) {
        console.error('Error fetching script:', error);
        throw error;
      }

      if (!data) return null;

      // Transform the data to match the Script interface
      const transformedScript = {
        ...data,
        script_data: typeof data.script_data === 'string' 
          ? JSON.parse(data.script_data) 
          : data.script_data
      };

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
    return <div>Loading script...</div>; // TODO: Add proper loading UI
  }

  return (
    <ScenarioChatScreen
      scenarioId={selectedScenario.id}
      scenarioTitle={selectedScenario.title}
      topicId={selectedScenario.topicId}
      characterId={selectedCharacter.id}
      characterName={selectedCharacter.name}
      selectedLanguage={selectedLanguage}
      onBackToCharacters={handleBackToCharacters}
      script={script}
    />
  );
};

export default ScenarioChat;