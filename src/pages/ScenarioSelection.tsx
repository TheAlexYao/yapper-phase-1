import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ScenarioSelectionScreen from "@/components/screens/ScenarioSelectionScreen";

const ScenarioSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedTopic = queryClient.getQueryData(['selectedTopic']) as { title: string; id: number } | undefined;

  const handleBackToTopics = () => {
    queryClient.removeQueries({ queryKey: ['selectedTopic'] });
    navigate('/topics');
  };

  const handleScenarioSelect = (scenarioTitle: string, scenarioId: string) => {
    // Convert string ID to number for the scripts table
    const numericScenarioId = parseInt(scenarioId);
    queryClient.setQueryData(['selectedScenario'], { 
      id: numericScenarioId, 
      title: scenarioTitle,
      topicId: selectedTopic?.id 
    });
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