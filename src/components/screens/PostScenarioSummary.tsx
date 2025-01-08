'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import ConversationReviewCard from '@/components/summary/ConversationReviewCard';
import WordAnalysisCard from '@/components/summary/WordAnalysisCard';
import { useToast } from "@/components/ui/use-toast";

interface PostScenarioSummaryProps {
  scenarioTitle: string;
  overallScore: number;
  transcript: Array<{
    role: 'user' | 'bot';
    text: string;
    audioUrl?: string;
    ttsUrl: string;
    score?: number;
    feedback?: any;
    transliteration?: string;
    translation?: string;
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
    transliteration?: string;
  }>;
  progressData: Array<{
    date: string;
    score: number;
  }>;
  onRestart: () => void;
  onExit: () => void;
  onNextScenario: () => void;
}

const PostScenarioSummary: React.FC<PostScenarioSummaryProps> = ({
  scenarioTitle,
  overallScore,
  transcript,
  progressData,
  onRestart,
  onExit,
  onNextScenario
}) => {
  const [currentCard, setCurrentCard] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const selectedLanguage = queryClient.getQueryData(['selectedLanguage']);

  const handleNextScenario = async () => {
    try {
      // Get current scenario ID from query client
      const currentScenario = queryClient.getQueryData(['selectedScenario']);
      
      // Fetch next available scenario
      const { data: scenarios, error } = await supabase
        .from('default_scenarios')
        .select('*')
        .eq('topic', currentScenario?.topic)
        .order('title', { ascending: true });

      if (error) throw error;

      // Find index of current scenario and get next one
      const currentIndex = scenarios.findIndex(s => s.id === currentScenario?.id);
      const nextScenario = scenarios[currentIndex + 1] || scenarios[0]; // Loop back to first if at end

      if (nextScenario) {
        // Update selected scenario in query client
        queryClient.setQueryData(['selectedScenario'], {
          id: nextScenario.id,
          title: nextScenario.title,
          topic: nextScenario.topic
        });
        
        // Call the provided onNextScenario callback
        onNextScenario();
      } else {
        toast({
          title: "No more scenarios",
          description: "You've completed all scenarios in this topic!",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching next scenario:', error);
      toast({
        title: "Error",
        description: "Failed to load next scenario. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSwipe = (direction: number) => {
    setCurrentCard(prev => Math.max(0, Math.min(1, prev + direction)));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe(-1);
      } else if (e.key === 'ArrowRight') {
        handleSwipe(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cards = [
    {
      title: "Conversation Review",
      content: (
        <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto px-4 pb-16">
          {transcript.map((line, index) => (
            <ConversationReviewCard 
              key={index} 
              line={{
                ...line,
                score: line.score || 0,
                feedback: line.feedback
              }} 
            />
          ))}
        </div>
      )
    },
    {
      title: "Progress Tracking",
      content: (
        <div className="space-y-6 h-full overflow-y-auto px-4">
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
              onClick={handleNextScenario}
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
    <div className="min-h-screen w-full bg-white flex flex-col">
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
              <span className="font-semibold">Score: {Math.round(overallScore)}%</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-[calc(100vh-16rem)] overflow-hidden"
              >
                <h2 className="text-xl font-bold mb-4">{cards[currentCard].title}</h2>
                {cards[currentCard].content}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>

      <footer className="sticky bottom-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center items-center gap-8">
            <Button 
              onClick={() => handleSwipe(-1)} 
              disabled={currentCard === 0}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-2 border-[#38b6ff] text-[#38b6ff] hover:bg-[#38b6ff] hover:text-white transition-all duration-300"
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
              disabled={currentCard === 1}
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-full border-2 border-[#38b6ff] text-[#38b6ff] hover:bg-[#38b6ff] hover:text-white transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PostScenarioSummary;
