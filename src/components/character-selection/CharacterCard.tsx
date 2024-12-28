import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Character {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  gender: string | null;
}

interface CharacterCardProps {
  character: Character;
  onSelect: () => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onSelect }) => {
  return (
    <Card 
      className="w-full h-full overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-2xl"
      onClick={onSelect}
    >
      <CardContent className="p-0 h-full relative">
        <img
          src={character.avatar_url || '/placeholder.svg'}
          alt={character.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{character.name}</h3>
          <p className="text-sm md:text-base text-white/90">{character.bio || 'A friendly conversation partner to help you practice your language skills.'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;