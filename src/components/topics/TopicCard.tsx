import { Card, CardContent } from "@/components/ui/card";
import { Database } from '@/integrations/supabase/types';

type Topic = Database['public']['Tables']['topics']['Row'];

interface TopicCardProps {
  topic: Topic;
  onSelect: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  // Use a specific image for dating topics
  const imageUrl = topic.title === 'Dating' 
    ? 'https://images.unsplash.com/photo-1516685018646-549198525c1b'  // Two people on a date
    : topic.image_url;

  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={imageUrl}
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

export default TopicCard;