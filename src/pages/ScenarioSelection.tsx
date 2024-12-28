import { useNavigate, useParams } from "react-router-dom";
import ScenarioSelectionScreen from "@/components/screens/ScenarioSelectionScreen";

const ScenarioSelection = () => {
  const navigate = useNavigate();
  const { topicTitle } = useParams();

  const handleBackToTopics = () => {
    navigate('/topics');
  };

  const handleScenarioSelect = (scenarioTitle: string, scenarioId: string) => {
    navigate(`/scenarios/${encodeURIComponent(scenarioTitle)}/characters`);
  };

  if (!topicTitle) {
    navigate('/topics');
    return null;
  }

  return (
    <ScenarioSelectionScreen
      topicTitle={decodeURIComponent(topicTitle)}
      onBackToTopics={handleBackToTopics}
      onScenarioSelect={handleScenarioSelect}
    />
  );
};

export default ScenarioSelection;