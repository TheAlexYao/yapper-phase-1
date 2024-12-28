import { useNavigate, useParams } from "react-router-dom";
import ScenarioSelectionScreen from "@/components/screens/ScenarioSelectionScreen";

const ScenarioSelection = () => {
  const navigate = useNavigate();
  const { topicTitle } = useParams();

  const handleBackToTopics = () => {
    navigate('/topics');
  };

  const handleScenarioSelect = (scenarioTitle: string, scenarioId: string) => {
    console.log("Selected scenario:", scenarioTitle, scenarioId);
    // Handle scenario selection here
    // For now, we'll just log it and could navigate to another page later
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