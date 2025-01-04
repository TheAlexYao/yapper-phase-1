import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  audioUrl: string;
  label?: string;
  variant?: 'user' | 'bot';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  label = '',
  variant = 'bot'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 rounded px-2 py-1 transition-colors duration-200 ${
        variant === 'user' 
          ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
      }`}
      onClick={togglePlayback}
    >
      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      <span className="text-xs font-medium">{label === "TTS" ? "Listen" : label}</span>
    </Button>
  );
};