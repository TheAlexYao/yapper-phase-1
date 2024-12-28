import { useNavigate, useParams } from "react-router-dom";
import ScenarioSelectionScreen from "@/components/screens/ScenarioSelectionScreen";

const ScenarioSelection = () => {
  const navigate = useNavigate();
  const { topicTitle } = useParams();

  // Extract language from URL parameter
  const language = new URLSearchParams(topicTitle?.split('?')[1]).get('lang') || 'en';
  const cleanTopicTitle = topicTitle?.split('?')[0];

  const handleBackToTopics = () => {
    navigate('/topics');
  };

  const handleScenarioSelect = (scenarioTitle: string, scenarioId: string) => {
    navigate(`/scenarios/${encodeURIComponent(scenarioTitle)}?lang=${language}/characters`);
  };

  if (!topicTitle) {
    navigate('/topics');
    return null;
  }

  return (
    <ScenarioSelectionScreen
      topicTitle={decodeURIComponent(cleanTopicTitle || '')}
      selectedLanguage={language}
      onBackToTopics={handleBackToTopics}
      onScenarioSelect={handleScenarioSelect}
    />
  );
};

export default ScenarioSelection;