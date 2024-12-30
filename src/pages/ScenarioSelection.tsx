import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ScenarioSelectionScreen from "@/components/screens/ScenarioSelectionScreen";

const ScenarioSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedTopic = queryClient.getQueryData(['selectedTopic']) as { id: string; title: string } | undefined;

  const handleBackToTopics = () => {
    queryClient.removeQueries(['selectedTopic']);
    navigate('/topics');
  };

  const handleScenarioSelect = (scenarioId: string, scenarioTitle: string) => {
    queryClient.setQueryData(['selectedScenario'], { id: scenarioId, title: scenarioTitle });
    navigate('/characters');
  };

  if (!selectedTopic) {
    navigate('/topics');
    return null;
  }

  return (
    <ScenarioSelectionScreen
      topicTitle={selectedTopic.title}
      selectedLanguage="en"
      onBackToTopics={handleBackToTopics}
      onScenarioSelect={handleScenarioSelect}
    />
  );
};

export default ScenarioSelection;