import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import PostScenarioSummary from './PostScenarioSummary';
import { useToast } from "@/hooks/use-toast";
import { RecordingControls } from "@/components/chat/RecordingControls";
import { ChatMessage, BotMessage, UserMessage, Script } from '@/types/chat';
import { assessPronunciation } from '@/services/pronunciationService';
import { handleRestartScenario, handleNextScenario } from '@/services/scenarioService';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import { LanguageCode } from '@/constants/languages';
import { ScriptManager } from './chat/ScriptManager';
import { createBotMessage, createUserMessage } from '@/utils/messageUtils';

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
  selectedLanguage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [scriptLines, setScriptLines] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const { toast } = useToast();

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
      setCurrentPrompt(createBotMessage({
        id: 'initial-prompt',
        text: firstUserPrompt.text,
        ttsText: firstUserPrompt.ttsText,
        transliteration: firstUserPrompt.transliteration,
        translation: firstUserPrompt.translation,
        tts_audio_url: firstUserPrompt.tts_audio_url,
        language_code: selectedLanguage
      }));
    }
  };

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
    const mockProgressData = [
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 75 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 80 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 85 },
      { date: new Date().toISOString().split('T')[0], score: calculateAverageScore() }
    ];

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
          score: msg.role === 'user' && msg.feedback?.NBest?.[0]?.PronunciationAssessment 
            ? msg.feedback.NBest[0].PronunciationAssessment.PronScore 
            : undefined,
          transliteration: msg.transliteration,
          translation: msg.translation,
          feedback: msg.role === 'user' ? msg.feedback : undefined
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
        onRestart={() => handleRestartScenario()}
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