import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Scenario } from "@/types/scenario";

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect }) => {
  // Default images for different topics when scenario image is missing
  const defaultTopicImages: { [key: string]: string } = {
    'Dating': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18',
    'Food': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
    'Business': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    'Travel': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05',
    'Friends': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac',
    'Daily Life': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952'
  };

  // Get the fallback image based on the topic, or use a generic placeholder
  const getFallbackImage = () => {
    return defaultTopicImages[scenario.topic] || '/placeholder.svg';
  };

  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={scenario.image_url || getFallbackImage()}
          alt={scenario.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = getFallbackImage();
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{scenario.title}</h3>
          <p className="text-sm md:text-base text-white/90">{scenario.description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;