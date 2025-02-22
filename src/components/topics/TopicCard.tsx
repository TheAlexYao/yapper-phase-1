import { Card, CardContent } from "@/components/ui/card";
import { Database } from '@/integrations/supabase/types';
import { useEffect } from "react";

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicCardProps {
  topic: Topic;
  onSelect: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  useEffect(() => {
    if (!topic.image_url) {
      console.warn(`No image URL for topic: ${topic.title}`);
    } else {
      console.log(`Loading image for topic: ${topic.title}, URL: ${topic.image_url}`);
    }
  }, [topic]);

  const handleImageError = () => {
    console.error(`Failed to load image for topic: ${topic.title}, URL: ${topic.image_url}`);
  };

  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={topic.image_url || '/placeholder.svg'}
          alt={topic.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{topic.title}</h3>
          <p className="text-sm md:text-base text-white/90">{topic.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicCard;