import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";

const TopicSelection = () => {
  const navigate = useNavigate();

  const handleTopicSelect = (topicTitle: string) => {
    console.log("Selected topic:", topicTitle);
    // Handle topic selection here
    // For now, we'll just log it and could navigate to another page later
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;