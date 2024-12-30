import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// Topic ID mapping based on the provided schema
const TOPIC_ID_MAP: { [key: string]: number } = {
  "Food": 1,
  "Friends": 2,
  "Business": 3,
  "Travel": 4,
  "Daily Life": 5,
  "Dating": 6
};

const TopicSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleTopicSelect = (topicTitle: string) => {
    const [title, lang] = topicTitle.split('?lang=');
    const topicId = TOPIC_ID_MAP[title];
    queryClient.setQueryData(['selectedTopic'], { title, id: topicId });
    navigate('/scenarios');
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;