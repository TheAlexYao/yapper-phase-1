import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Turtle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  label: string;
  showSpeedControl?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, label, showSpeedControl = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border rounded px-2 py-1"
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        <span className="text-xs font-medium">{label === "TTS" ? "Audio" : label}</span>
      </Button>
      {showSpeedControl && (
        <Button
          variant="outline"
          size="sm"
          className="border rounded p-1"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.playbackRate = 0.7;
              audioRef.current.play();
            }
          }}
        >
          <Turtle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default AudioPlayer;