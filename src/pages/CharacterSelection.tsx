import { useNavigate, useParams } from "react-router-dom";
import CharacterSelectionScreen from "@/components/screens/CharacterSelectionScreen";

const CharacterSelection = () => {
  const navigate = useNavigate();
  const { scenarioTitle } = useParams();

  const handleBackToScenarios = () => {
    navigate(-1);
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    navigate(`/scenarios/${characterId}/${encodeURIComponent(scenarioTitle!)}/chat/${encodeURIComponent(characterName)}`);
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