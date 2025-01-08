import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ScenarioSelectionScreen from "@/components/screens/ScenarioSelectionScreen";
import { LanguageCode } from "@/constants/languages";

const ScenarioSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const selectedTopic = queryClient.getQueryData(['selectedTopic']) as { title: string; id: string } | undefined;
  const selectedLanguage = queryClient.getQueryData(['selectedLanguage']) as LanguageCode;

  const handleBackToTopics = () => {
    queryClient.removeQueries({ queryKey: ['selectedTopic'] });
    navigate('/topics');
  };

  const handleScenarioSelect = (scenarioTitle: string, scenarioId: string) => {
    queryClient.setQueryData(['selectedScenario'], { 
      id: scenarioId,
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
      selectedLanguage={selectedLanguage}
      onBackToTopics={handleBackToTopics}
      onScenarioSelect={handleScenarioSelect}
    />
  );
};

export default ScenarioSelection;