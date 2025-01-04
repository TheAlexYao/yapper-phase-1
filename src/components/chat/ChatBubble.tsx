import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/chat';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import PronunciationFeedbackModal from './PronunciationFeedbackModal';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  console.log('ChatBubble received message:', message);
  console.log('Message feedback:', message.feedback);
  console.log('Message role:', message.role);
  
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const isUser = message.role === 'user';

  // Calculate overall score with proper fallbacks
  const calculateOverallScore = () => {
    console.log('Calculating overall score with feedback:', message.feedback);
    
    if (!message.feedback || !message.feedback.NBest?.[0]?.PronunciationAssessment) {
      console.log('No valid feedback structure found');
      return null;
    }

    const assessment = message.feedback.NBest[0].PronunciationAssessment;
    console.log('Assessment data:', assessment);
    
    // Try different score properties in order of preference
    const score = assessment.PronScore ?? 
                 assessment.pronScore ?? 
                 message.score ?? 
                 // If no direct scores are available, calculate average of component scores
                 ((assessment.AccuracyScore ?? assessment.accuracyScore) + 
                  (assessment.FluencyScore ?? assessment.fluencyScore) + 
                  (assessment.CompletenessScore ?? assessment.completenessScore)) / 3;
    
    console.log('Calculated score:', score);
    return typeof score === 'number' && !isNaN(score) ? score : null;
  };

  const overallScore = calculateOverallScore();
  console.log('Final overall score:', overallScore);
  console.log('Should show feedback button:', overallScore !== null && message.feedback);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser 
            ? 'bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white' 
            : 'bg-white border border-gray-200 shadow-sm'
        }`}
      >
        <div className="space-y-2">
          <p className="mb-1">{message.text}</p>
          
          {message.transliteration && (
            <p className="text-sm opacity-80">{message.transliteration}</p>
          )}
          
          {message.translation && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs ${isUser ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setShowTranslation(!showTranslation)}
              >
                <Globe className="h-4 w-4 mr-1" />
                {showTranslation ? 'Hide' : 'Show'} Translation
              </Button>
              
              {showTranslation && (
                <p className={`text-sm mt-2 ${isUser ? 'text-white/80' : 'text-gray-600'}`}>
                  {message.translation}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {message.tts_audio_url && (
              <AudioPlayer 
                audioUrl={message.tts_audio_url} 
                label="TTS"
                variant={isUser ? 'user' : 'bot'}
              />
            )}
            
            {message.user_audio_url && (
              <AudioPlayer 
                audioUrl={message.user_audio_url} 
                label="Your Recording"
                variant={isUser ? 'user' : 'bot'}
              />
            )}
          </div>

          {isUser && message.feedback && overallScore !== null && (
            <Button
              variant="ghost"
              size="sm"
              className={`mt-2 w-full justify-between ${
                isUser 
                  ? 'text-white hover:bg-white/20' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setShowFeedback(true)}
            >
              <span>Score: {Math.round(overallScore)}%</span>
              <span className="text-xs opacity-80">Click for details</span>
            </Button>
          )}

          {message.feedback && (
            <PronunciationFeedbackModal
              isOpen={showFeedback}
              onClose={() => setShowFeedback(false)}
              feedback={message.feedback}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;