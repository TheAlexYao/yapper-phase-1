import { useNavigate, useParams, useLocation } from "react-router-dom";
import ScenarioChatScreen from "@/components/screens/ScenarioChatScreen";

const ScenarioChat = () => {
  const navigate = useNavigate();
  const { scenarioId, scenarioTitle, characterName } = useParams();
  const location = useLocation();
  
  // Extract language from URL parameter
  const language = new URLSearchParams(location.search).get('lang') || 'en';

  const handleBackToCharacters = () => {
    navigate(-1);
  };

  if (!scenarioId || !scenarioTitle || !characterName) {
    navigate('/topics');
    return null;
  }

  return (
    <ScenarioChatScreen
      scenarioId={scenarioId}
      scenarioTitle={decodeURIComponent(scenarioTitle)}
      characterName={decodeURIComponent(characterName)}
      selectedLanguage={language}
      onBackToCharacters={handleBackToCharacters}
    />
  );
};

export default ScenarioChat;