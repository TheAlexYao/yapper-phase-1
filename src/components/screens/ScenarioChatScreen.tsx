import React, { useRef, useState } from 'react';
import { useScriptMessages } from '@/hooks/useScriptMessages';
import PostScenarioSummary from './PostScenarioSummary';
import { UserMessage } from '@/types/chat';
import ChatInterface from '../chat/ChatInterface';

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
  const [showSummary, setShowSummary] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    setMessages,
    currentPrompt,
    setCurrentPrompt,
    scriptMessages,
    currentMessageIndex,
    setCurrentMessageIndex,
    isLoading,
    isConversationComplete,
    setIsConversationComplete
  } = useScriptMessages(scenarioId, selectedLanguage);

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
          const botResponse = {
            id: Date.now().toString(),
            role: 'bot' as const,
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
    <ChatInterface
      characterName={characterName}
      scenarioTitle={scenarioTitle}
      messages={messages}
      currentPrompt={currentPrompt}
      isConversationComplete={isConversationComplete}
      chatEndRef={chatEndRef}
      onBackToCharacters={onBackToCharacters}
      onRecordingComplete={handleRecordingComplete}
      onShowSummary={() => setShowSummary(true)}
    />
  );
};

export default ScenarioChatScreen;