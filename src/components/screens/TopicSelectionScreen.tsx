'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import FloatingElements from '@/components/FloatingElements';
import LanguageSelector from '@/components/topics/LanguageSelector';
import TopicCarousel from '@/components/topics/TopicCarousel';
import { useToast } from "@/components/ui/use-toast";
import { Database } from '@/integrations/supabase/types';

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicSelectionScreenProps {
  onTopicSelect: (topicTitle: string) => void;
}

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({ onTopicSelect }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const { data: topics = [], isLoading, error } = useQuery({
    queryKey: ['topics', selectedLanguage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }

      return data || [];
    },
  });

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setCurrentIndex(0);
  };

  const handleTopicSelect = useCallback((topicId: string) => {
    const selectedTopic = topics.find(topic => topic.id === topicId);
    if (selectedTopic) {
      onTopicSelect(selectedTopic.title);
    }
  }, [topics, onTopicSelect]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentIndex(current => {
      if (direction === 'prev') {
        return current === 0 ? topics.length - 1 : current - 1;
      } else {
        return current === topics.length - 1 ? 0 : current + 1;
      }
    });
  }, [topics.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'Enter') {
        const selectedTopic = topics[currentIndex];
        if (selectedTopic) {
          handleTopicSelect(selectedTopic.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, topics, currentIndex, handleTopicSelect]);

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load topics. Please try again later.",
    });
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-between">
      <FloatingElements />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[#7843e6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38b6ff] to-[#7843e6] mb-2">
            Choose a Topic
          </h1>
          <div className="relative z-50">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center w-full max-w-sm px-4">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : (
            <TopicCarousel
              topics={topics}
              currentIndex={currentIndex}
              onNavigate={navigate}
              onTopicSelect={handleTopicSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicSelectionScreen;