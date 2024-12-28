'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import FloatingElements from '@/components/FloatingElements';

interface Character {
  id: string;
  name: string;
  description: string;
  image_url: string;
  gender: 'female' | 'male';
}

const CharacterCard: React.FC<{ character: Character; onSelect: () => void }> = ({ character, onSelect }) => {
  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={character.image_url}
          alt={character.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{character.name}</h3>
          <p className="text-sm md:text-base text-white/90">{character.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface CharacterSelectionScreenProps {
  scenarioTitle: string;
  onBackToScenarios: () => void;
  onCharacterSelect: (characterId: string, characterName: string) => void;
}

const CharacterSelectionScreen: React.FC<CharacterSelectionScreenProps> = ({ scenarioTitle, onBackToScenarios, onCharacterSelect }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        // Simulating API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        const fetchedCharacters: Character[] = [
          { 
            id: '1', 
            name: 'Sophia', 
            description: 'A friendly and patient conversation partner to help you practice your language skills in everyday situations.', 
            image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80', 
            gender: 'female'
          },
          { 
            id: '2', 
            name: 'Alex', 
            description: 'An encouraging and supportive language partner who will guide you through various scenarios to improve your fluency.', 
            image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80', 
            gender: 'male'
          },
        ];
        // Sort characters to ensure the female character is displayed first
        const sortedCharacters = fetchedCharacters.sort((a, b) => 
          a.gender === 'female' ? -1 : b.gender === 'female' ? 1 : 0
        );
        setCharacters(sortedCharacters);
        setError(null);
      } catch (err) {
        setError('Failed to load conversation partners. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentIndex(current => {
      if (direction === 'prev') {
        return current === 0 ? characters.length - 1 : current - 1;
      } else {
        return current === characters.length - 1 ? 0 : current + 1;
      }
    });
  }, [characters.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'Enter') {
        const selectedCharacter = characters[currentIndex];
        if (selectedCharacter) {
          onCharacterSelect(selectedCharacter.id, selectedCharacter.name);
        }
      } else if (event.key === 'Backspace') {
        onBackToScenarios();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, characters, currentIndex, onCharacterSelect, onBackToScenarios]);

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
              onClick={onBackToScenarios}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38b6ff] to-[#7843e6]">
              Choose Your Partner
            </h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
          <p className="text-lg text-gray-600 mb-4">Select a conversation partner for: {scenarioTitle}</p>
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
                  {characters.map((character) => (
                    <div key={character.id} className="w-full h-full flex-shrink-0">
                      <CharacterCard
                        character={character}
                        onSelect={() => onCharacterSelect(character.id, character.name)}
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

export default CharacterSelectionScreen;
