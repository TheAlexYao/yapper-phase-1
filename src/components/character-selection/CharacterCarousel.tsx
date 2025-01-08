import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CharacterCard from './CharacterCard';

interface Character {
  id: string;  // Changed from string to handle UUID consistently
  name: string;
  bio: string | null;
  avatar_url: string | null;
  gender: string | null;
}

interface CharacterCarouselProps {
  characters: Character[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onSelect: (characterId: string, characterName: string) => void;
}

const CharacterCarousel: React.FC<CharacterCarouselProps> = ({
  characters,
  currentIndex,
  onNavigate,
  onSelect,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
      onNavigate('next');
    } else if (diff < -50) {
      onNavigate('prev');
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
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
                onSelect={() => onSelect(character.id, character.name)}
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
          onClick={() => onNavigate('prev')}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white rounded-full p-2 border-none"
          onClick={() => onNavigate('next')}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

export default CharacterCarousel;