import React from 'react';
import { motion } from 'framer-motion';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import PronunciationFeedbackModal from '@/components/chat/PronunciationFeedbackModal';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface ConversationReviewCardProps {
  line: {
    role: 'user' | 'bot';
    text: string;
    transliteration?: string;
    translation?: string;
    audioUrl?: string;
    ttsUrl: string;
    score?: number;
    feedback?: any;
  };
}

const ConversationReviewCard: React.FC<ConversationReviewCardProps> = ({ line }) => {
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);

  const displayScore = line.score !== undefined ? Math.round(line.score) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg ${
        line.role === 'user' 
          ? 'bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10' 
          : 'bg-gray-50'
      }`}
    >
      <div className="space-y-2">
        {/* Original Text */}
        <p className={`mb-2 ${line.role === 'user' ? 'font-medium' : ''}`}>{line.text}</p>
        
        {/* Transliteration */}
        {line.transliteration && (
          <p className="text-sm text-gray-600">{line.transliteration}</p>
        )}
        
        {/* Translation Toggle */}
        {line.translation && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-600 hover:bg-gray-100"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              <Globe className="h-4 w-4 mr-1" />
              {showTranslation ? 'Hide' : 'Show'} Translation
            </Button>
            
            {showTranslation && (
              <p className="text-sm mt-2 text-gray-600">
                {line.translation}
              </p>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* User Recording */}
          {line.role === 'user' && line.audioUrl && (
            <AudioPlayer audioUrl={line.audioUrl} label="Your Recording" />
          )}
          
          {/* Reference Audio */}
          {line.ttsUrl && (
            <AudioPlayer audioUrl={line.ttsUrl} label="Reference Audio" />
          )}
          
          {/* Score and Feedback */}
          {line.role === 'user' && line.score !== undefined && (
            <button
              onClick={() => setShowFeedback(true)}
              className="text-sm bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white px-3 py-1 rounded-full hover:opacity-90 transition-opacity"
            >
              Score: {displayScore}%
            </button>
          )}
        </div>
      </div>

      {/* Pronunciation Feedback Modal */}
      {line.role === 'user' && line.feedback && (
        <PronunciationFeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          feedback={line.feedback}
        />
      )}
    </motion.div>
  );
};

export default ConversationReviewCard;