import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PostScenarioSummary from './PostScenarioSummary';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage, BotMessage, UserMessage, Script } from '@/types/chat';
import { assessPronunciation } from '@/services/pronunciationService';
import { handleRestartScenario, handleNextScenario } from '@/services/scenarioService';
import { LanguageCode } from '@/constants/languages';
import { ChatSessionManager } from './chat/ChatSessionManager';
import { ScriptManager } from './chat/ScriptManager';
import { createBotMessage, createUserMessage } from '@/utils/messageUtils';
import { SessionProvider } from '@/components/chat/SessionProvider';
import ScenarioContent from '@/components/chat/ScenarioContent';
import { useQuery } from '@tanstack/react-query';

interface ScenarioChatScreenProps {
  scenarioId: string;
  scenarioTitle: string;
  topicId: string;
  characterId: string;
  characterName: string;
  selectedLanguage: LanguageCode;
  onBackToCharacters: () => void;
  script: Script | null;
}

const ScenarioChatScreen: React.FC<ScenarioChatScreenProps> = ({
  scenarioId,
  scenarioTitle,
  characterName,
  onBackToCharacters,
  script,
  characterId,
  selectedLanguage,
  topicId
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [scriptLines, setScriptLines] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['chatSession', scenarioId, characterId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('character_id', characterId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return sessions;
    },
    staleTime: Infinity,
  });

  const handleRecordingComplete = async (audioUrl: string, audioBlob: Blob) => {
    if (currentPrompt) {
      try {
        console.log('Starting recording assessment for prompt:', currentPrompt.text);
        
        const { score, feedback } = await assessPronunciation(
          audioBlob, 
          currentPrompt.text,
          selectedLanguage
        );
        
        console.log('Assessment completed:', { score, feedback });

        const newMessage = createUserMessage({
          id: Date.now().toString(),
          text: currentPrompt.text,
          ttsText: currentPrompt.ttsText,
          transliteration: currentPrompt.transliteration,
          translation: currentPrompt.translation,
          tts_audio_url: currentPrompt.tts_audio_url,
          user_audio_url: audioUrl,
          score: score,
          language_code: selectedLanguage,
          feedback: {
            overall_score: score,
            phoneme_analysis: feedback.phonemeAnalysis,
            word_scores: feedback.wordScores,
            suggestions: feedback.suggestions,
            NBest: [{
              PronunciationAssessment: {
                AccuracyScore: feedback.accuracyScore,
                FluencyScore: feedback.fluencyScore,
                CompletenessScore: feedback.completenessScore,
                PronScore: score,
                finalScore: score
              },
              Words: feedback.words
            }]
          }
        });

        setMessages(prevMessages => [...prevMessages, newMessage]);
        setCurrentPrompt(null);

        const nextIndex = currentLineIndex + 1;
        if (nextIndex < scriptLines.length) {
          const nextLine = scriptLines[nextIndex];
          setCurrentLineIndex(nextIndex);
          
          if (nextLine.role === 'bot') {
            setMessages(prevMessages => [...prevMessages, nextLine]);
            
            const nextUserIndex = nextIndex + 1;
            if (nextUserIndex < scriptLines.length && scriptLines[nextUserIndex].role === 'user') {
              setCurrentPrompt(createBotMessage({
                id: Date.now().toString(),
                text: scriptLines[nextUserIndex].text,
                ttsText: scriptLines[nextUserIndex].ttsText,
                transliteration: scriptLines[nextUserIndex].transliteration,
                translation: scriptLines[nextUserIndex].translation,
                tts_audio_url: scriptLines[nextUserIndex].tts_audio_url,
                language_code: selectedLanguage,
              }));
              setCurrentLineIndex(nextUserIndex);
            }
          } else if (nextLine.role === 'user') {
            setCurrentPrompt(createBotMessage({
              id: Date.now().toString(),
              text: nextLine.text,
              ttsText: nextLine.ttsText,
              transliteration: nextLine.transliteration,
              translation: nextLine.translation,
              tts_audio_url: nextLine.tts_audio_url,
              language_code: selectedLanguage,
            }));
          }
        } else {
          setIsConversationComplete(true);
        }
      } catch (error) {
        console.error('Error processing recording:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to assess pronunciation. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const calculateAverageScore = () => {
    const userMessages = messages.filter(message => message.role === 'user' && message.score !== null);
    if (userMessages.length === 0) return 0;
    const totalScore = userMessages.reduce((sum, message) => sum + (message.score || 0), 0);
    return totalScore / userMessages.length;
  };

  const calculateDetailedScores = () => {
    const userMessages = messages.filter(msg => 
      msg.role === 'user' && msg.feedback?.NBest?.[0]?.PronunciationAssessment
    ) as UserMessage[];
    
    if (userMessages.length === 0) return {
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      pronScore: 0
    };

    const scores = userMessages.reduce((acc, msg) => {
      const assessment = msg.feedback.NBest[0].PronunciationAssessment;
      return {
        accuracyScore: acc.accuracyScore + (assessment.AccuracyScore || 0),
        fluencyScore: acc.fluencyScore + (assessment.FluencyScore || 0),
        completenessScore: acc.completenessScore + (assessment.CompletenessScore || 0),
        pronScore: acc.pronScore + (assessment.PronScore || 0)
      };
    }, {
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      pronScore: 0
    });

    const messageCount = userMessages.length;
    return {
      accuracyScore: Math.round(scores.accuracyScore / messageCount),
      fluencyScore: Math.round(scores.fluencyScore / messageCount),
      completenessScore: Math.round(scores.completenessScore / messageCount),
      pronScore: Math.round(scores.pronScore / messageCount)
    };
  };

  if (isConversationComplete) {
    return (
      <PostScenarioSummary
        scenarioTitle={scenarioTitle}
        overallScore={calculateAverageScore()}
        transcript={messages.map(msg => ({
          role: msg.role,
          text: msg.text,
          audioUrl: msg.user_audio_url || undefined,
          ttsUrl: msg.tts_audio_url,
          score: msg.role === 'user' && msg.feedback?.NBest?.[0]?.PronunciationAssessment 
            ? msg.feedback.NBest[0].PronunciationAssessment.PronScore 
            : undefined,
          transliteration: msg.transliteration,
          translation: msg.translation,
          feedback: msg.role === 'user' ? msg.feedback : undefined
        }))}
        detailedScores={calculateDetailedScores()}
        wordLevelFeedback={messages
          .filter((msg): msg is UserMessage => msg.role === 'user')
          .flatMap(msg => 
            msg.feedback?.NBest?.[0]?.Words?.map(word => ({
              word: word.Word,
              accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
              errorType: word.PronunciationAssessment?.ErrorType || 'none'
            })) || []
          )}
        progressData={[
          { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 75 },
          { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 80 },
          { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 85 },
          { date: new Date().toISOString().split('T')[0], score: calculateAverageScore() }
        ]}
        onRestart={() => session?.id && handleRestartScenario(session.id)}
        onExit={onBackToCharacters}
        onNextScenario={async () => {
          const nextScenario = await handleNextScenario(scenarioId, topicId);
          if (nextScenario) {
            onBackToCharacters();
          } else {
            toast({
              title: "No more scenarios",
              description: "You've completed all scenarios in this topic!",
              variant: "default"
            });
            onBackToCharacters();
          }
        }}
        currentScenarioId={scenarioId}
        topicId={topicId}
      />
    );
  }

  return (
    <SessionProvider>
      <ChatSessionManager
        scenarioId={scenarioId}
        characterId={characterId}
        selectedLanguage={selectedLanguage}
        script={script}
        onSessionLoaded={handleSessionLoaded}
      />

      <ScriptManager
        script={script}
        selectedLanguage={selectedLanguage}
        onScriptLoaded={handleScriptLoaded}
      />

      <ScenarioContent
        characterName={characterName}
        scenarioTitle={scenarioTitle}
        onBackToCharacters={onBackToCharacters}
        currentPrompt={currentPrompt}
        onRecordingComplete={handleRecordingComplete}
      />
    </SessionProvider>
  );
};

export default ScenarioChatScreen;
