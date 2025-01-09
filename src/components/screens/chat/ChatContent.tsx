import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { RecordingControls } from "@/components/chat/RecordingControls";
import { ChatMessage, BotMessage, Script } from '@/types/chat';
import { assessPronunciation } from '@/services/pronunciationService';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import { LanguageCode } from '@/constants/languages';
import { createBotMessage, createUserMessage } from '@/utils/messageUtils';
import { supabase } from "@/integrations/supabase/client";

interface ChatContentProps {
  scenarioTitle: string;
  characterName: string;
  selectedLanguage: LanguageCode;
  onBackToCharacters: () => void;
  script: Script;
  scriptLines: ChatMessage[];
}

export const ChatContent = ({
  scenarioTitle,
  characterName,
  selectedLanguage,
  onBackToCharacters,
  scriptLines,
}: ChatContentProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const { toast } = useToast();

  // Initialize conversation if no messages
  useState(() => {
    if (messages.length === 0 && scriptLines.length > 0) {
      const firstLine = scriptLines[0];
      if (firstLine.role === 'bot') {
        setMessages([firstLine]);
        setCurrentLineIndex(1);
        
        if (scriptLines[1]?.role === 'user') {
          setCurrentPrompt(createBotMessage({
            id: Date.now().toString(),
            text: scriptLines[1].text,
            ttsText: scriptLines[1].ttsText,
            transliteration: scriptLines[1].transliteration,
            translation: scriptLines[1].translation,
            tts_audio_url: scriptLines[1].tts_audio_url,
            language_code: selectedLanguage,
          }));
        }
      }
    }
  });

  const handleRecordingComplete = async (audioUrl: string, audioBlob: Blob) => {
    if (!currentPrompt) return;

    try {
      const { score, feedback } = await assessPronunciation(
        audioBlob,
        currentPrompt.text,
        selectedLanguage
      );

      const newMessage = createUserMessage({
        id: Date.now().toString(),
        text: currentPrompt.text,
        ttsText: currentPrompt.ttsText,
        transliteration: currentPrompt.transliteration,
        translation: currentPrompt.translation,
        tts_audio_url: currentPrompt.tts_audio_url,
        user_audio_url: audioUrl,
        score,
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

      const newMessages = [...messages, newMessage];
      const nextIndex = currentLineIndex + 1;

      if (nextIndex < scriptLines.length) {
        const nextLine = scriptLines[nextIndex];
        
        if (nextLine.role === 'bot') {
          newMessages.push(nextLine);
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
          setCurrentLineIndex(nextIndex);
        }
        
        setMessages(newMessages);
      } else {
        setIsConversationComplete(true);
        setMessages(newMessages);
        
        // Save progress to user_scenarios
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const averageScore = newMessages
            .filter(m => m.role === 'user' && m.score !== null)
            .reduce((acc, m) => acc + (m.score || 0), 0) / newMessages.filter(m => m.role === 'user').length;

          await supabase
            .from('user_scenarios')
            .upsert({
              user_id: session.user.id,
              scenario_id: scriptLines[0].scenario_id,
              status: 'completed',
              completed_at: new Date().toISOString(),
              pronunciation_score: averageScore,
              attempts_count: 1
            });
        }
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assess pronunciation. Please try again.",
        variant: "destructive"
      });
    }
  };

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