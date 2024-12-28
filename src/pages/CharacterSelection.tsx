import { useNavigate, useParams } from "react-router-dom";
import CharacterSelectionScreen from "@/components/screens/CharacterSelectionScreen";

const CharacterSelection = () => {
  const navigate = useNavigate();
  const { scenarioTitle } = useParams();

  // Extract language from URL parameter
  const language = new URLSearchParams(scenarioTitle?.split('?')[1]).get('lang') || 'en';
  const cleanScenarioTitle = scenarioTitle?.split('?')[0];

  const handleBackToScenarios = () => {
    navigate(-1);
  };

  const handleCharacterSelect = (characterId: string, characterName: string) => {
    navigate(`/scenarios/${characterId}/${encodeURIComponent(cleanScenarioTitle!)}/chat/${encodeURIComponent(characterName)}?lang=${language}`);
  };

  if (!scenarioTitle) {
    navigate('/topics');
    return null;
  }

  return (
    <CharacterSelectionScreen
      scenarioTitle={decodeURIComponent(cleanScenarioTitle || '')}
      selectedLanguage={language}
      onBackToScenarios={handleBackToScenarios}
      onCharacterSelect={handleCharacterSelect}
    />
  );
};

export default CharacterSelection;