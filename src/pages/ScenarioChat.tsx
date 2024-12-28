import { useNavigate, useParams } from "react-router-dom";
import ScenarioChatScreen from "@/components/screens/ScenarioChatScreen";

const ScenarioChat = () => {
  const navigate = useNavigate();
  const { scenarioId, scenarioTitle, characterName } = useParams();

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
      onBackToCharacters={handleBackToCharacters}
    />
  );
};

export default ScenarioChat;