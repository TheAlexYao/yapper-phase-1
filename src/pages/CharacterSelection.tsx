import { useNavigate, useParams } from "react-router-dom";
import CharacterSelectionScreen from "@/components/screens/CharacterSelectionScreen";

const CharacterSelection = () => {
  const navigate = useNavigate();
  const { scenarioTitle } = useParams();

  const handleBackToScenarios = () => {
    navigate(-1);
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    console.log("Selected character:", characterName, characterId);
    // Handle character selection here
    // For now, we'll just log it and could navigate to another page later
  };

  if (!scenarioTitle) {
    navigate('/topics');
    return null;
  }

  return (
    <CharacterSelectionScreen
      scenarioTitle={decodeURIComponent(scenarioTitle)}
      onBackToScenarios={handleBackToScenarios}
      onCharacterSelect={handleCharacterSelect}
    />
  );
};

export default CharacterSelection;