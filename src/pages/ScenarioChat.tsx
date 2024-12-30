import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ScenarioChatScreen from "@/components/screens/ScenarioChatScreen";

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

  const handleBackToCharacters = () => {
    queryClient.removeQueries({ queryKey: ['selectedCharacter'] });
    navigate('/characters');
  };

  if (!selectedScenario || !selectedCharacter) {
    navigate('/topics');
    return null;
  }

  return (
    <ScenarioChatScreen
      scenarioId={selectedScenario.id}
      scenarioTitle={selectedScenario.title}
      topicId={selectedScenario.topicId}
      characterId={selectedCharacter.id}
      characterName={selectedCharacter.name}
      selectedLanguage="en"
      onBackToCharacters={handleBackToCharacters}
    />
  );
};

export default ScenarioChat;