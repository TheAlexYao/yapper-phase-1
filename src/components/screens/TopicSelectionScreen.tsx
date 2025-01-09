import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import TopicCarousel from "@/components/topics/TopicCarousel";
import LanguageSelector from "@/components/topics/LanguageSelector";
import type { LanguageCode } from "@/constants/languages";

const TopicSelectionScreen = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en-US");

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

  const handleTopicSelect = (topicTitle: string) => {
    navigate(`/scenarios?topic=${topicTitle}&lang=${selectedLanguage}`);
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
      <TopicCarousel onTopicSelect={handleTopicSelect} />
    </div>
  );
};

export default TopicSelectionScreen;