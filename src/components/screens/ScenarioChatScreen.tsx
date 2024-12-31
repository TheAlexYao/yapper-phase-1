import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PostScenarioSummary from './PostScenarioSummary';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RecordingControls } from "@/components/chat/RecordingControls";
import { ChatMessage, BotMessage, UserMessage, Script } from '@/types/chat';
import { assessPronunciation } from '@/services/pronunciationService';
import { handleRestartScenario, handleNextScenario } from '@/services/scenarioService';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import { LanguageCode } from '@/constants/languages';
import { ChatSessionManager } from './chat/ChatSessionManager';
import { ScriptManager } from './chat/ScriptManager';

interface ScenarioChatScreenProps {
  scenarioId: number;
  scenarioTitle: string;
  topicId: number;
  characterId: number;
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
  selectedLanguage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [scriptLines, setScriptLines] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('chat_sessions')
          .update({
            messages: messages,
            current_line_index: currentLineIndex,
            updated_at: new Date().toISOString()
          })
          .eq('scenario_id', scenarioId)
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating session:', error);
        toast({
          title: "Error",
          description: "Failed to save chat progress",
          variant: "destructive"
        });
      }
    };

    updateSession();
  }, [messages, currentLineIndex, scenarioId, toast]);

  const handleSessionLoaded = (sessionMessages: ChatMessage[], sessionLineIndex: number) => {
    setMessages(sessionMessages);
    setCurrentLineIndex(sessionLineIndex);
    
    if (scriptLines.length > sessionLineIndex) {
      const nextUserPrompt = scriptLines.slice(sessionLineIndex).find(line => line.role === 'user');
      if (nextUserPrompt) {
        setCurrentPrompt({
          id: Date.now().toString(),
          role: 'bot',
          text: nextUserPrompt.text,
          transliteration: nextUserPrompt.transliteration,
          translation: nextUserPrompt.translation,
          tts_audio_url: nextUserPrompt.tts_audio_url,
          user_audio_url: null,
          score: null,
          language_code: selectedLanguage
        });
      }
    }
  };

  const handleScriptLoaded = (
    newScriptLines: ChatMessage[],
    initialMessages: ChatMessage[],
    initialLineIndex: number
  ) => {
    setScriptLines(newScriptLines);
    setMessages(initialMessages);
    setCurrentLineIndex(initialLineIndex);

    const firstUserPrompt = newScriptLines.find(line => line.role === 'user');
    if (firstUserPrompt) {
      setCurrentPrompt({
        id: 'initial-prompt',
        role: 'bot',
        text: firstUserPrompt.text,
        transliteration: firstUserPrompt.transliteration,
        translation: firstUserPrompt.translation,
        tts_audio_url: firstUserPrompt.tts_audio_url,
        user_audio_url: null,
        score: null,
        language_code: selectedLanguage
      });
    }
  };

  const handleRecordingComplete = async (audioUrl: string, audioBlob: Blob) => {
    if (currentPrompt) {
      try {
        console.log('Starting recording assessment for prompt:', currentPrompt.text);
        
        const { score, feedback } = await assessPronunciation(audioBlob, currentPrompt.text);
        
        console.log('Assessment completed:', { score, feedback });

        const newMessage: UserMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: currentPrompt.text,
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
                PronScore: score
              },
              Words: feedback.words
            }]
          }
        };

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
              setCurrentPrompt({
                id: Date.now().toString(),
                role: 'bot',
                text: scriptLines[nextUserIndex].text,
                transliteration: scriptLines[nextUserIndex].transliteration,
                translation: scriptLines[nextUserIndex].translation,
                tts_audio_url: scriptLines[nextUserIndex].tts_audio_url,
                user_audio_url: null,
                score: null,
                language_code: selectedLanguage,
              });
              setCurrentLineIndex(nextUserIndex);
            }
          } else if (nextLine.role === 'user') {
            setCurrentPrompt({
              id: Date.now().toString(),
              role: 'bot',
              text: nextLine.text,
              transliteration: nextLine.transliteration,
              translation: nextLine.translation,
              tts_audio_url: nextLine.tts_audio_url,
              user_audio_url: null,
              score: null,
              language_code: selectedLanguage,
            });
          }
        } else {
          setIsConversationComplete(true);
        }
      } catch (error) {
        console.error('Error processing recording:', error);
        toast({
          title: "Error",
          description: "Failed to assess pronunciation. Please try again.",
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

  if (isConversationComplete) {
    const mockProgressData = [
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 75 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 80 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 85 },
      { date: new Date().toISOString().split('T')[0], score: calculateAverageScore() }
    ];

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

    const detailedScores = calculateDetailedScores();
    const overallScore = Math.round(
      (detailedScores.accuracyScore + 
       detailedScores.fluencyScore + 
       detailedScores.completenessScore + 
       detailedScores.pronScore) / 4
    );

    console.log('Detailed scores:', detailedScores);
    console.log('Messages being passed:', messages);

    return (
      <PostScenarioSummary
        scenarioTitle={scenarioTitle}
        overallScore={overallScore}
        transcript={messages.map(msg => ({
          role: msg.role,
          text: msg.text,
          audioUrl: msg.user_audio_url || undefined,
          ttsUrl: msg.tts_audio_url,
          score: msg.role === 'user' ? Math.round(msg.score || 0) : undefined
        }))}
        detailedScores={detailedScores}
        wordLevelFeedback={messages
          .filter((msg): msg is UserMessage => 
            msg.role === 'user'
          )
          .flatMap(msg => 
            msg.feedback?.NBest?.[0]?.Words?.map(word => ({
              word: word.Word,
              accuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
              errorType: word.PronunciationAssessment?.ErrorType || 'none'
            })) || []
          )}
        progressData={mockProgressData}
        onRestart={() => sessionId && handleRestartScenario(sessionId)}
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

        <ChatHeader
          characterName={characterName}
          scenarioTitle={scenarioTitle}
          onBackToCharacters={onBackToCharacters}
        />

        <ChatMessages messages={messages} />

        <RecordingControls
          currentPrompt={currentPrompt}
          onRecordingComplete={handleRecordingComplete}
        />
      </div>
    </div>
  );
};

export default ScenarioChatScreen;
