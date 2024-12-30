import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CharacterSelectionScreen from "@/components/screens/CharacterSelectionScreen";

const CharacterSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedScenario = queryClient.getQueryData(['selectedScenario']) as { id: string; title: string } | undefined;

  const handleBackToScenarios = () => {
    queryClient.removeQueries(['selectedScenario']);
    navigate('/scenarios');
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    queryClient.setQueryData(['selectedCharacter'], { id: characterId, name: characterName });
    navigate('/chat');
  };

  if (!selectedScenario) {
    navigate('/scenarios');
    return null;
  }

  return (
    <CharacterSelectionScreen
      scenarioTitle={selectedScenario.title}
      selectedLanguage="en"
      onBackToScenarios={handleBackToScenarios}
      onCharacterSelect={handleCharacterSelect}
    />
  );
};

export default CharacterSelection;