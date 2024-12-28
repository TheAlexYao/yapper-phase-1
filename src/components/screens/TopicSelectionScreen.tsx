'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FloatingElements from '@/components/FloatingElements';

interface Topic {
  id: string;
  title: string;
  description: string;
  image_url: string;
  language: string;
}

interface TopicSelectionScreenProps {
  onTopicSelect: (topicTitle: string) => void;
}

const TopicCard: React.FC<{ topic: Topic; onSelect: () => void }> = ({ topic, onSelect }) => {
  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={topic.image_url}
          alt={topic.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h3>
          <p className="text-sm md:text-base text-white/90">{topic.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const LanguageSelector: React.FC<{ selectedLanguage: string; onLanguageChange: (language: string) => void }> = ({ selectedLanguage, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  ];

  return (
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-[180px] bg-white text-gray-800 border-2 border-[#38b6ff] rounded-md">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-white border-2 border-[#38b6ff]">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="flex items-center gap-2">
            <span>{lang.flag}</span> {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const TopicSelectionScreen: React.FC<TopicSelectionScreenProps> = ({ onTopicSelect }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fetchedTopics: Topic[] = [
          { 
            id: '1', 
            title: 'Food', 
            description: 'Learn about local cuisine', 
            image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80', 
            language: selectedLanguage 
          },
          { 
            id: '2', 
            title: 'Travel', 
            description: 'Explore new destinations', 
            image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80', 
            language: selectedLanguage 
          },
          { 
            id: '3', 
            title: 'Business', 
            description: 'Master professional communication', 
            image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80', 
            language: selectedLanguage 
          },
          { 
            id: '4', 
            title: 'Dating', 
            description: 'Navigate romantic situations', 
            image_url: 'https://images.unsplash.com/photo-1511306404404-ad607bd7c601?auto=format&fit=crop&q=80', 
            language: selectedLanguage 
          },
        ];
        setTopics(fetchedTopics);
        setError(null);
      } catch (err) {
        setError('Failed to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [selectedLanguage]);

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    if (Math.abs(diff) > 5) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      navigate('next');
    } else if (diff < -50) {
      navigate('prev');
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    container.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      container.removeEventListener('touchmove', preventScroll);
    };
  }, []);

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

        <div 
          ref={containerRef}
          className="relative flex flex-col items-center justify-center w-full max-w-sm px-4"
        >
          {loading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              <div 
                className="w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl mb-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="flex h-full transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {topics.map((topic) => (
                    <div key={topic.id} className="w-full h-full flex-shrink-0">
                      <TopicCard
                        topic={topic}
                        onSelect={() => handleTopicSelect(topic.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-4 w-full">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white rounded-full p-2 border-none"
                  onClick={() => navigate('prev')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white rounded-full p-2 border-none"
                  onClick={() => navigate('next')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicSelectionScreen;
