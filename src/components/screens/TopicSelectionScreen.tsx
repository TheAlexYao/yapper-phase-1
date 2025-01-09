import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import TopicCarousel from "@/components/topics/TopicCarousel";
import LanguageSelector from "@/components/topics/LanguageSelector";
import type { LanguageCode } from "@/constants/languages";
import type { Database } from "@/integrations/supabase/types";

type Topic = Database['public']['Tables']['topics']['Row'];

const TopicSelectionScreen = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en-US");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch topics
  const { data: topics = [] } = useQuery<Topic[]>({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's profile to get their target language
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: profile } = await supabase
        .from("profiles")
        .select("target_language")
        .eq("id", user.id)
        .single();

      return profile;
    }
  });

  // Update selected language when profile is loaded
  useEffect(() => {
    if (profile?.target_language) {
      setSelectedLanguage(profile.target_language as LanguageCode);
    }
  }, [profile]);

  const handleTopicSelect = (topicId: string) => {
    const selectedTopic = topics.find(topic => topic.id === topicId);
    if (selectedTopic) {
      navigate(`/scenarios?topic=${selectedTopic.title}&lang=${selectedLanguage}`);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(current => 
        current > 0 ? current - 1 : topics.length - 1
      );
    } else {
      setCurrentIndex(current => 
        current < topics.length - 1 ? current + 1 : 0
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Choose a Topic</h1>
      <div className="mb-8">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>
      <TopicCarousel
        topics={topics}
        currentIndex={currentIndex}
        onNavigate={handleNavigate}
        onTopicSelect={handleTopicSelect}
      />
    </div>
  );
};

export default TopicSelectionScreen;