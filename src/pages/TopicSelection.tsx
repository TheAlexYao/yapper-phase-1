import TopicSelectionScreen from "@/components/screens/TopicSelectionScreen";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LanguageCode } from "@/constants/languages";

const TopicSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleTopicSelect = async (topicTitle: string) => {
    const [title, lang] = topicTitle.split('?lang=');
    
    // Store both topic and language in React Query cache
    queryClient.setQueryData(['selectedTopic'], { title });
    queryClient.setQueryData(['selectedLanguage'], lang as LanguageCode);
    queryClient.setQueryData(['userGender'], 'male'); // Set default gender
    
    navigate('/scenarios');
  };

  return <TopicSelectionScreen onTopicSelect={handleTopicSelect} />;
};

export default TopicSelection;