import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";

const TopicSelection = () => {
  const navigate = useNavigate();

  const handleTopicSelect = (topicTitle: string) => {
    navigate(`/topics/${encodeURIComponent(topicTitle)}/scenarios`);
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;