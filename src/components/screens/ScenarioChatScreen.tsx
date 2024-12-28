import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import PostScenarioSummary from './PostScenarioSummary';
import { ChatMessage, BotMessage, UserMessage } from '@/types/chat';
import ChatHeader from '../chat/ChatHeader';
import ChatMessages from '../chat/ChatMessages';
import ChatInput from '../chat/ChatInput';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScriptMessages = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching script messages for:', { scenarioId, selectedLanguage });
        
        // First get the script template that matches our scenario and language
        const { data: template, error: templateError } = await supabase
          .from('script_templates')
          .select(`
            id,
            scenario_id,
            character_id,
            city_id,
            cities!inner (
              id,
              language_id,
              languages!inner (
                id,
                code
              )
            )
          `)
          .eq('scenario_id', scenarioId)
          .eq('cities.languages.code', selectedLanguage)
          .single();

        if (templateError) {
          console.error('Error fetching script template:', templateError);
          toast({
            title: "Error",
            description: "Failed to load conversation script. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!template) {
          console.error('No script template found for:', { scenarioId, selectedLanguage });
          toast({
            title: "Not Available",
            description: `This conversation is not yet available in ${selectedLanguage}. Please try another language.`,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        console.log('Found template:', template);

        // Now fetch all messages for this template
        const { data: messages, error: messagesError } = await supabase
          .from('script_messages')
          .select('*')
          .eq('script_template_id', template.id)
          .order('line_number', { ascending: true });

        if (messagesError) {
          console.error('Error fetching script messages:', messagesError);
          toast({
            title: "Error",
            description: "Failed to load conversation messages. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!messages || messages.length === 0) {
          console.error('No messages found for template:', template.id);
          toast({
            title: "No Content",
            description: "No conversation content is available for this scenario yet.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        console.log('Found messages:', messages);
        setScriptMessages(messages);
        
        // Set up initial messages
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
        console.error('Error in fetchScriptMessages:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchScriptMessages();
  }, [scenarioId, selectedLanguage, toast]);

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
        onRestart={() => {
          setShowSummary(false);
          setMessages([]);
          setCurrentPrompt(null);
          setCurrentMessageIndex(0);
          setIsConversationComplete(false);
        }}
        onExit={onBackToCharacters}
        onNextScenario={() => console.log("Moving to next scenario")}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-shift"></div>
      </div>

      <div className="relative z-20 flex flex-col h-full">
        <ChatHeader
          characterName={characterName}
          scenarioTitle={scenarioTitle}
          onBackToCharacters={onBackToCharacters}
        />

        <ChatMessages messages={messages} chatEndRef={chatEndRef} />

        {isConversationComplete ? (
          <div className="fixed inset-x-0 bottom-0 bg-white border-t p-4 flex flex-col items-center space-y-4">
            <h3 className="text-xl font-bold text-center">Conversation Complete!</h3>
            <p className="text-center text-gray-600">Great job! You've completed this conversation scenario.</p>
            <Button onClick={() => setShowSummary(true)}>View Summary</Button>
          </div>
        ) : (
          <ChatInput
            currentPrompt={currentPrompt}
            onRecordingComplete={handleRecordingComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ScenarioChatScreen;