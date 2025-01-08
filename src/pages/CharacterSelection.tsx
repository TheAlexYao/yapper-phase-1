import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CharacterSelectionScreen from "@/components/screens/CharacterSelectionScreen";
import { LanguageCode } from "@/constants/languages";

const CharacterSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedScenario = queryClient.getQueryData(['selectedScenario']) as { 
    id: string; 
    title: string;
    topicId: string;
  } | undefined;
  const selectedLanguage = queryClient.getQueryData(['selectedLanguage']) as LanguageCode;

  const handleBackToScenarios = () => {
    queryClient.removeQueries({ queryKey: ['selectedScenario'] });
    navigate('/scenarios');
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    // Navigate to chat with all required information
    navigate('/chat', {
      state: {
        scenarioId: selectedScenario?.id,
        characterId,
        selectedLanguage,
        scenarioTitle: selectedScenario?.title,
        characterName,
        topicId: selectedScenario?.topicId
      }
    });
  };

  if (!selectedScenario) {
    navigate('/scenarios');
    return null;
  }

  return (
    <CharacterSelectionScreen
      scenarioTitle={selectedScenario.title}
      selectedLanguage={selectedLanguage}
      onBackToScenarios={handleBackToScenarios}
      onCharacterSelect={handleCharacterSelect}
    />
  );
};

export default CharacterSelection;