'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import FloatingElements from '@/components/FloatingElements';

interface Scenario {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const ScenarioCard: React.FC<{ scenario: Scenario; onSelect: () => void }> = ({ scenario, onSelect }) => {
  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={scenario.image_url}
          alt={scenario.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{scenario.title}</h3>
          <p className="text-sm md:text-base text-white/90">{scenario.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface ScenarioSelectionScreenProps {
  topicTitle: string;
  onBackToTopics: () => void;
  onScenarioSelect: (scenarioTitle: string, scenarioId: string) => void;
}

const ScenarioSelectionScreen: React.FC<ScenarioSelectionScreenProps> = ({ topicTitle, onBackToTopics, onScenarioSelect }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScenarioSelect = useCallback((scenarioId: string) => {
    const selectedScenario = scenarios.find(scenario => scenario.id === scenarioId);
    if (selectedScenario) {
      onScenarioSelect(selectedScenario.title, selectedScenario.id);
    }
  }, [scenarios, onScenarioSelect]);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setLoading(true);
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fetchedScenarios: Scenario[] = [
          { 
            id: '1', 
            title: 'First Date at a Café', 
            description: 'Navigate a casual first date conversation', 
            image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80', 
          },
          { 
            id: '2', 
            title: 'Meeting Friends at a Party', 
            description: 'Socialize with new acquaintances at a gathering', 
            image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80', 
          },
          { 
            id: '3', 
            title: 'Job Interview', 
            description: 'Ace your next job interview with confidence', 
            image_url: 'https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&q=80', 
          },
          { 
            id: '4', 
            title: 'Ordering at a Restaurant', 
            description: 'Learn how to order food and interact with waitstaff', 
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80', 
          },
        ];
        setScenarios(fetchedScenarios);
        setError(null);
      } catch (err) {
        setError('Failed to load scenarios. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentIndex(current => {
      if (direction === 'prev') {
        return current === 0 ? scenarios.length - 1 : current - 1;
      } else {
        return current === scenarios.length - 1 ? 0 : current + 1;
      }
    });
  }, [scenarios.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'Enter') {
        const selectedScenario = scenarios[currentIndex];
        if (selectedScenario) {
          handleScenarioSelect(selectedScenario.id);
        }
      } else if (event.key === 'Backspace') {
        onBackToTopics();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, scenarios, currentIndex, handleScenarioSelect, onBackToTopics]);

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
        <div className="flex flex-col items-center mb-4 w-full px-4">
          <div className="w-full flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800"
              onClick={onBackToTopics}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
              {topicTitle} Scenarios
            </h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
          <p className="text-lg text-gray-600 mb-4">Choose a scenario to practice</p>
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
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="w-full h-full flex-shrink-0">
                      <ScenarioCard
                        scenario={scenario}
                        onSelect={() => handleScenarioSelect(scenario.id)}
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

export default ScenarioSelectionScreen;

