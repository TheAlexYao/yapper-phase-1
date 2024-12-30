import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const TopicSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleTopicSelect = (topicId: string, topicTitle: string) => {
    queryClient.setQueryData(['selectedTopic'], { id: topicId, title: topicTitle });
    navigate('/scenarios');
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;