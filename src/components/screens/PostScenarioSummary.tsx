'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PostScenarioSummaryProps {
  scenarioTitle: string;
  overallScore: number;
  transcript: Array<{
    role: 'user' | 'bot';
    text: string;
    audioUrl?: string;
    ttsUrl: string;
    score?: number;
  }>;
  detailedScores: {
    accuracyScore: number;
    fluencyScore: number;
    completenessScore: number;
    pronScore: number;
  };
  wordLevelFeedback: Array<{
    word: string;
    accuracyScore: number;
    errorType: string;
  }>;
  progressData: Array<{
    date: string;
    score: number;
  }>;
  onRestart: () => void;
  onExit: () => void;
  onNextScenario: () => void;
}

const AudioPlayer: React.FC<{ audioUrl: string; label: string }> = ({ audioUrl, label }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, []);

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
    <div className="flex items-center space-x-2">
      <Button 
        size="sm" 
        onClick={togglePlayback} 
        className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 text-white transition-all duration-300"
      >
        <Play className={`h-4 w-4 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
        {label}
      </Button>
      <audio ref={audioRef} src={audioUrl} />
    </div>
  );
};

const PostScenarioSummary: React.FC<PostScenarioSummaryProps> = ({
  scenarioTitle,
  overallScore,
  transcript,
  detailedScores,
  wordLevelFeedback,
  progressData,
  onRestart,
  onExit,
  onNextScenario
}) => {
  const [currentCard, setCurrentCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSwipe = (direction: number) => {
    setCurrentCard(prev => Math.max(0, Math.min(2, prev + direction)));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX: number;
    const threshold = 50;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX) return;
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      if (Math.abs(diff) > threshold) {
        handleSwipe(diff > 0 ? 1 : -1);
        startX = 0;
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const cards = [
    {
      title: "Conversation Review",
      content: (
        <div className="space-y-4">
          {transcript.map((line, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg ${
                line.role === 'user' 
                  ? 'bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10' 
                  : 'bg-gray-50'
              }`}
            >
              <p className={`mb-2 ${line.role === 'user' ? 'font-medium' : ''}`}>{line.text}</p>
              {line.role === 'user' && (
                <div className="flex flex-wrap gap-2 items-center">
                  {line.audioUrl && <AudioPlayer audioUrl={line.audioUrl} label="Your Recording" />}
                  <AudioPlayer audioUrl={line.ttsUrl} label="Reference Audio" />
                  {line.score !== undefined && (
                    <span className="text-sm bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white px-3 py-1 rounded-full">
                      Score: {line.score}%
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )
    },
    {
      title: "Performance Analysis",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            {Object.entries(detailedScores).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between mb-1">
                  <span className="capitalize text-sm font-medium">
                    {key.replace('Score', '')}
                  </span>
                  <span className="text-sm font-semibold">{value}%</span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="absolute h-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6]"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3">Word-Level Analysis</h4>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {wordLevelFeedback.map((word, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm font-medium">{word.word}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${word.accuracyScore}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6]"
                      />
                    </div>
                    {word.errorType !== 'none' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                        {word.errorType}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Progress Tracking",
      content: (
        <div className="space-y-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="url(#colorGradient)" 
                  strokeWidth={2}
                  dot={{ fill: '#38b6ff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#7843e6' }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38b6ff" />
                    <stop offset="100%" stopColor="#7843e6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onNextScenario} 
              className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 text-white transition-all duration-300"
            >
              Continue to Next Scenario
            </Button>
            <Button 
              onClick={onRestart} 
              variant="outline"
              className="w-full border-2 border-[#38b6ff] text-[#38b6ff] hover:bg-gradient-to-r hover:from-[#38b6ff] hover:to-[#7843e6] hover:text-white transition-all duration-300"
            >
              Practice Again
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onExit}
                className="hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">{scenarioTitle}</h1>
                <p className="text-sm opacity-90">Scenario Complete</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="font-semibold">Score: {overallScore}%</span>
            </div>
          </div>
        </div>
      </header>

      <main 
        ref={containerRef}
        className="container mx-auto px-4 py-6"
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle>{cards[currentCard].title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {cards[currentCard].content}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button 
            onClick={() => handleSwipe(-1)} 
            disabled={currentCard === 0}
            variant="ghost"
            size="icon"
            className="text-[#38b6ff]"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex gap-2">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCard(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentCard === index 
                    ? 'bg-gradient-to-r from-[#38b6ff] to-[#7843e6] w-6' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <Button 
            onClick={() => handleSwipe(1)} 
            disabled={currentCard === 2}
            variant="ghost"
            size="icon"
            className="text-[#38b6ff]"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default PostScenarioSummary;