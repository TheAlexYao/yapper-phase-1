'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from "@/integrations/supabase/client";
import PostScenarioSummary from './PostScenarioSummary';
import ChatBubble from '../chat/ChatBubble';
import RecordingInterface from '../chat/RecordingInterface';
import AudioPlayer from '../chat/AudioPlayer';
import { ChatMessage, BotMessage, UserMessage } from '@/types/chat';

interface ScenarioChatScreenProps {
  scenarioId: string;
  scenarioTitle: string;
  characterName: string;
  selectedLanguage: string;
  onBackToCharacters: () => void;
}

const ScenarioChatScreen: React.FC<ScenarioChatScreenProps> = ({
  scenarioId,
  scenarioTitle,
  characterName,
  selectedLanguage,
  onBackToCharacters
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [scriptMessages, setScriptMessages] = useState<any[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchScriptMessages = async () => {
      try {
        const { data: templates, error: templateError } = await supabase
          .from('script_templates')
          .select('id')
          .eq('scenario_id', scenarioId)
          .single();

        if (templateError) throw templateError;

        const { data: messages, error: messagesError } = await supabase
          .from('script_messages')
          .select('*')
          .eq('script_template_id', templates.id)
          .order('line_number', { ascending: true });

        if (messagesError) throw messagesError;

        setScriptMessages(messages);
        if (messages.length > 0) {
          const firstMessage = messages[0];
          setMessages([{
            id: '1',
            role: 'bot',
            text: firstMessage.content,
            transliteration: firstMessage.transliteration,
            translation: firstMessage.translation,
            tts_audio_url: firstMessage.audio_url || '/audio/welcome.mp3',
            user_audio_url: null,
            score: null,
          }]);
          
          if (messages[1]) {
            setCurrentPrompt({
              id: '2',
              role: 'bot',
              text: messages[1].content,
              transliteration: messages[1].transliteration,
              translation: messages[1].translation,
              tts_audio_url: messages[1].audio_url || '/audio/user-prompt.mp3',
              user_audio_url: null,
              score: null,
            });
          }
          setCurrentMessageIndex(1);
        }
      } catch (error) {
        console.error('Error fetching script messages:', error);
      }
    };

    fetchScriptMessages();
  }, [scenarioId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRecordingComplete = (audioUrl: string, score: number) => {
    if (currentPrompt && currentMessageIndex < scriptMessages.length) {
      const newMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        text: currentPrompt.text,
        transliteration: currentPrompt.transliteration,
        translation: currentPrompt.translation,
        tts_audio_url: currentPrompt.tts_audio_url,
        user_audio_url: audioUrl,
        score: score,
        feedback: {
          overall_score: score,
          phoneme_analysis: "Sample phoneme analysis",
          word_scores: {},
          suggestions: "Sample suggestions",
          NBest: [{
            PronunciationAssessment: {
              AccuracyScore: 95,
              FluencyScore: 90,
              CompletenessScore: 85,
              PronScore: score
            },
            Words: [
              {
                Word: "Sample",
                PronunciationAssessment: {
                  AccuracyScore: 95,
                  ErrorType: "none"
                }
              }
            ]
          }]
        }
      };

      setMessages(prev => [...prev, newMessage]);
      setCurrentPrompt(null);

      // Add bot response after a delay
      setTimeout(() => {
        const nextBotMessage = scriptMessages[currentMessageIndex + 1];
        if (nextBotMessage) {
          const botResponse: BotMessage = {
            id: Date.now().toString(),
            role: 'bot',
            text: nextBotMessage.content,
            transliteration: nextBotMessage.transliteration,
            translation: nextBotMessage.translation,
            tts_audio_url: nextBotMessage.audio_url || '/audio/bot-response.mp3',
            user_audio_url: null,
            score: null,
          };
          setMessages(prev => [...prev, botResponse]);

          // Set up next user prompt
          const nextUserPrompt = scriptMessages[currentMessageIndex + 2];
          if (nextUserPrompt) {
            setCurrentPrompt({
              id: Date.now().toString(),
              role: 'bot',
              text: nextUserPrompt.content,
              transliteration: nextUserPrompt.transliteration,
              translation: nextUserPrompt.translation,
              tts_audio_url: nextUserPrompt.audio_url || '/audio/user-prompt.mp3',
              user_audio_url: null,
              score: null,
            });
            setCurrentMessageIndex(currentMessageIndex + 2);
          } else {
            setIsConversationComplete(true);
          }
        }
      }, 1000);
    }
  };

  const handleViewSummary = () => {
    setShowSummary(true);
  };

  const handleRestartScenario = () => {
    setShowSummary(false);
    setMessages([]);
    setCurrentPrompt(null);
    setCurrentMessageIndex(0);
    setIsConversationComplete(false);
  };

  const handleNextScenario = () => {
    // Implement logic to move to the next scenario
    console.log("Moving to next scenario");
  };

  const calculateAverageScore = () => {
    const userMessages = messages.filter(message => message.role === 'user' && message.score !== null);
    if (userMessages.length === 0) return 0;
    const totalScore = userMessages.reduce((sum, message) => sum + (message.score || 0), 0);
    return totalScore / userMessages.length;
  };

  if (showSummary) {
    return (
      <PostScenarioSummary
        scenarioTitle={scenarioTitle}
        overallScore={calculateAverageScore()}
        transcript={messages.map(msg => ({
          role: msg.role,
          text: msg.text,
          audioUrl: msg.user_audio_url || undefined,
          ttsUrl: msg.tts_audio_url,
          score: msg.score || undefined
        }))}
        detailedScores={{
          accuracyScore: 85,
          fluencyScore: 80,
          completenessScore: 90,
          pronScore: calculateAverageScore()
        }}
        wordLevelFeedback={messages
          .filter((msg): msg is UserMessage => msg.role === 'user' && msg.feedback !== undefined)
          .flatMap(msg => msg.feedback.NBest[0].Words.map(word => ({
            word: word.Word,
            accuracyScore: word.PronunciationAssessment.AccuracyScore,
            errorType: word.PronunciationAssessment.ErrorType
          })))
        }
        progressData={[
          { date: '2023-05-01', score: 75 },
          { date: '2023-05-02', score: 80 },
          { date: '2023-05-03', score: 85 },
          { date: '2023-05-04', score: calculateAverageScore() }
        ]}
        onRestart={handleRestartScenario}
        onExit={onBackToCharacters}
        onNextScenario={handleNextScenario}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift"></div>
      </div>

      <div className="relative z-20 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-800 hover:bg-opacity-80 transition-colors duration-200"
            onClick={onBackToCharacters}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-center flex-grow">
            Chat with {characterName}: {scenarioTitle}
          </h1>
          <div className="w-10"></div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-white/80">
          <AnimatePresence>
            {messages.map(message => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {isConversationComplete ? (
          <div className="fixed inset-x-0 bottom-0 bg-white border-t p-4 flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold text-center">Conversation Complete!</h3>
            <p className="text-center text-gray-600">Great job! You've completed this conversation scenario.</p>
            <Button onClick={handleViewSummary}>View Summary</Button>
          </div>
        ) : (
          currentPrompt && (
            <div className="border-t bg-white flex flex-col items-center w-full">
              <div className="p-4 w-full flex flex-col items-center">
                <h3 className="font-semibold mb-2 text-center">Your turn:</h3>
                <p className="text-sm md:text-base text-center">{currentPrompt.text}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1 text-center">{currentPrompt.transliteration}</p>
                <div className="mt-2 flex flex-col items-center gap-2">
                  <AudioPlayer audioUrl={currentPrompt.tts_audio_url} label="TTS" />
                  <RecordingInterface onRecordingComplete={handleRecordingComplete} />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ScenarioChatScreen;
