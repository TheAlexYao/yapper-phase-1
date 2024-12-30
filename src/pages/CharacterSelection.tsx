import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CharacterSelectionScreen from "@/components/screens/CharacterSelectionScreen";

// Character ID mapping based on the provided schema
const CHARACTER_ID_MAP: { [key: string]: number } = {
  "Rick": 1,
  "Sabrina": 2,
  "Alex": 3,
  "Jaymie": 4,
  "Andrew": 5,
  "Lada": 6,
  "Julian": 7,
  "Angela": 8,
  "Matt": 9,
  "Erica": 10,
  "Sam": 11,
  "Kim": 12
};

const CharacterSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedScenario = queryClient.getQueryData(['selectedScenario']) as { 
    id: number; 
    title: string;
    topicId: number;
  } | undefined;

  const handleBackToScenarios = () => {
    queryClient.removeQueries({ queryKey: ['selectedScenario'] });
    navigate('/scenarios');
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    const numericCharacterId = CHARACTER_ID_MAP[characterName];
    queryClient.setQueryData(['selectedCharacter'], { 
      id: numericCharacterId, 
      name: characterName 
    });
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