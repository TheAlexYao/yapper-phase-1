import { motion } from 'framer-motion';
import { ChatMessage } from '@/types/chat';
import { useState } from 'react';
import { Volume2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from './RecordingControls';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble = ({ message }: ChatBubbleProps) => {
  const [showTranslation, setShowTranslation] = useState(false);
  const isUser = message.role === 'user';

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
                showSpeedControl={!isUser}
              />
            )}
            
            {message.user_audio_url && (
              <AudioPlayer 
                audioUrl={message.user_audio_url} 
                label="Your Recording" 
                showSpeedControl={false}
              />
            )}
          </div>

          {message.score !== null && (
            <div className={`mt-2 p-2 rounded-md ${
              isUser ? 'bg-white/10' : 'bg-gray-50'
            }`}>
              <p className={`text-sm font-medium ${
                isUser ? 'text-white' : 'text-gray-700'
              }`}>
                Score: {message.score}
              </p>
              {message.feedback && (
                <div className="mt-1 space-y-1">
                  <p className={`text-xs ${
                    isUser ? 'text-white/80' : 'text-gray-600'
                  }`}>
                    {message.feedback.suggestions}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.feedback.NBest?.[0].Words.map((word, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          word.PronunciationAssessment.ErrorType === 'None'
                            ? isUser 
                              ? 'bg-white/20 text-white' 
                              : 'bg-green-100 text-green-800'
                            : isUser
                              ? 'bg-red-400/20 text-white'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {word.Word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;