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
  const [showTranslation, setShowTranslation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const isUser = message.role === 'user';

  // Calculate overall score with proper fallbacks
  const calculateOverallScore = () => {
    // First try to get the score directly from the message
    if (typeof message.score === 'number') {
      return message.score;
    }
    // Fallback to PronScore from feedback if available
    if (message.feedback?.NBest?.[0]?.PronunciationAssessment?.PronScore !== undefined) {
      return message.feedback.NBest[0].PronunciationAssessment.PronScore;
    }
    return null;
  };

  const overallScore = calculateOverallScore();

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
              />
            )}
            
            {message.user_audio_url && (
              <AudioPlayer 
                audioUrl={message.user_audio_url} 
                label="Your Recording" 
              />
            )}
          </div>

          {overallScore !== null && message.feedback && (
            <div 
              className={`mt-2 p-2 rounded-md cursor-pointer transition-colors ${
                isUser 
                  ? 'bg-white/10 hover:bg-white/20' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setShowFeedback(true)}
            >
              <p className={`text-sm font-medium ${
                isUser ? 'text-white' : 'text-gray-700'
              }`}>
                Score: {Math.round(overallScore)}%
              </p>
              <p className={`text-xs ${
                isUser ? 'text-white/80' : 'text-gray-500'
              }`}>
                Click for detailed feedback
              </p>
            </div>
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