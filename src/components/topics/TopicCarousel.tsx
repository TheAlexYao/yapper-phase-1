import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TopicCard from './TopicCard';
import { Database } from '@/integrations/supabase/types';

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicCarouselProps {
  topics: Topic[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onTopicSelect: (topicId: string) => void;
}

const TopicCarousel: React.FC<TopicCarouselProps> = ({
  topics,
  currentIndex,
  onNavigate,
  onTopicSelect,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onNavigate('prev');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNavigate('next');
    }
  };

  return (
    <>
      <div 
        className="w-full max-w-2xl mx-auto aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-2xl shadow-xl mb-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Topic carousel"
      >
        <div 
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {topics.map((topic) => (
            <div key={topic.id} className="w-full h-full flex-shrink-0">
              <TopicCard
                topic={topic}
                onSelect={() => onTopicSelect(topic.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4 w-full max-w-2xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white rounded-full p-2 border-none"
          onClick={() => onNavigate('prev')}
          aria-label="Previous topic"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white rounded-full p-2 border-none"
          onClick={() => onNavigate('next')}
          aria-label="Next topic"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
};

export default TopicCarousel;