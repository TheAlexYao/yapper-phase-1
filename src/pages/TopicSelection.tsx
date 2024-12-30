import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const TopicSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleTopicSelect = (topicTitle: string) => {
    const [title, lang] = topicTitle.split('?lang=');
    queryClient.setQueryData(['selectedTopic'], { title });
    navigate('/scenarios');
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;