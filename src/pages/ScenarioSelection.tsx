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
    // Fix: Remove the slash before 'characters' to prevent double slashes
    navigate(`/scenarios/${encodeURIComponent(scenarioTitle)}/characters?lang=${language}`);
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