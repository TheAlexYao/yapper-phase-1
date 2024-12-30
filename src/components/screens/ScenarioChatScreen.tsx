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

interface ScenarioChatScreenProps {
  scenarioId: number;
  scenarioTitle: string;
  topicId: number;
  characterId: number;
  characterName: string;
  selectedLanguage: string;
  onBackToCharacters: () => void;
  script: Script | null;
}

const ScenarioChatScreen: React.FC<ScenarioChatScreenProps> = ({
  scenarioId,
  scenarioTitle,
  characterName,
  onBackToCharacters,
  script,
  characterId
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [scriptLines, setScriptLines] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadOrCreateSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to use this feature",
            variant: "destructive"
          });
          return;
        }

        const { data: existingSessions, error: fetchError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('scenario_id', scenarioId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (existingSessions && existingSessions.length > 0) {
          const session = existingSessions[0];
          setSessionId(session.id);
          setMessages((session.messages as unknown as ChatMessage[]) || []);
          setCurrentLineIndex(session.current_line_index || 0);
          
          if (scriptLines.length > (session.current_line_index || 0)) {
            const nextUserPrompt = scriptLines.slice(session.current_line_index || 0).find(line => line.role === 'user');
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
              });
            }
          }
        } else {
          const { data: newSession, error: createError } = await supabase
            .from('chat_sessions')
            .insert([{
              scenario_id: scenarioId,
              character_id: characterId,
              user_id: user.id,
              messages: [],
              current_line_index: 0
            }])
            .select()
            .single();

          if (createError) throw createError;
          if (newSession) {
            setSessionId(newSession.id);
          }
        }
      } catch (error) {
        console.error('Error managing session:', error);
        toast({
          title: "Error",
          description: "Failed to load or create chat session",
          variant: "destructive"
        });
      }
    };

    if (script) {
      loadOrCreateSession();
    }
  }, [script, scenarioId, characterId]);

  useEffect(() => {
    const updateSession = async () => {
      if (!sessionId) return;

      try {
        const { error } = await supabase
          .from('chat_sessions')
          .update({
            messages: messages as any[],
            current_line_index: currentLineIndex,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

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
  }, [messages, currentLineIndex, sessionId]);

  useEffect(() => {
    if (script) {
      const initialScriptLines: ChatMessage[] = script.script_data.lines.map((line, index) => ({
        id: `${index}`,
        role: line.speaker === 'character' ? 'bot' : 'user',
        text: line.targetText,
        transliteration: line.transliteration,
        translation: line.translation,
        tts_audio_url: line.audioUrl || '',
        user_audio_url: null,
        score: null,
      }));
      setScriptLines(initialScriptLines);
      
      if (initialScriptLines.length > 0 && initialScriptLines[0].role === 'bot') {
        setMessages([initialScriptLines[0]]);
        setCurrentLineIndex(1);
        
        const firstUserPrompt = initialScriptLines.find(line => line.role === 'user');
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
          });
        }
      }
    }
  }, [script]);

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

        console.log('Created new message:', JSON.stringify(newMessage, null, 2));

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
        msg.role === 'user' && msg.feedback !== undefined
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
          accuracyScore: acc.accuracyScore + assessment.AccuracyScore,
          fluencyScore: acc.fluencyScore + assessment.FluencyScore,
          completenessScore: acc.completenessScore + assessment.CompletenessScore,
          pronScore: acc.pronScore + assessment.PronScore
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

    return (
      <PostScenarioSummary
        scenarioTitle={scenarioTitle}
        overallScore={overallScore}
        transcript={messages.map(msg => ({
          role: msg.role,
          text: msg.text,
          audioUrl: msg.user_audio_url || undefined,
          ttsUrl: msg.tts_audio_url,
          score: msg.role === 'user' ? msg.feedback?.overall_score : undefined
        }))}
        detailedScores={detailedScores}
        wordLevelFeedback={messages
          .filter((msg): msg is UserMessage => 
            msg.role === 'user' && msg.feedback !== undefined
          )
          .flatMap(msg => 
            msg.feedback.NBest[0].Words.map(word => ({
              word: word.Word,
              accuracyScore: word.PronunciationAssessment.AccuracyScore,
              errorType: word.PronunciationAssessment.ErrorType || 'none'
            }))
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
