'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import ConversationReviewCard from '@/components/summary/ConversationReviewCard';
import { handleNextScenario } from '@/services/scenarioService';

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
  currentScenarioId: string;
  topicId: string;
}

const PostScenarioSummary: React.FC<PostScenarioSummaryProps> = ({
  scenarioTitle,
  overallScore,
  transcript,
  onRestart,
  onExit,
  onNextScenario,
  currentScenarioId,
  topicId,
}) => {
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleContinueToNext = async () => {
    try {
      setIsNavigating(true);
      const nextScenario = await handleNextScenario(currentScenarioId, topicId);
      
      if (nextScenario) {
        onNextScenario();
      } else {
        toast({
          title: "No more scenarios",
          description: "You've completed all scenarios in this topic!",
          variant: "default"
        });
        onExit();
      }
    } catch (error) {
      console.error('Error navigating to next scenario:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to load next scenario. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsNavigating(false);
    }
  };

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
                key={0}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-[calc(100vh-16rem)] overflow-hidden"
              >
                <h2 className="text-xl font-bold mb-4">Conversation Review</h2>
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
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>

      <footer className="sticky bottom-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center items-center gap-8">
            <Button 
              onClick={handleContinueToNext}
              disabled={isNavigating}
              className="w-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 text-white transition-all duration-300"
            >
              {isNavigating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Loading next scenario...
                </div>
              ) : (
                'Continue to Next Scenario'
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PostScenarioSummary;