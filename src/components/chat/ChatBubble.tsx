import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatMessage } from '@/types/chat';
import AudioPlayer from './AudioPlayer';
import FeedbackModal from './FeedbackModal';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.role === 'bot' ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <Card className={`max-w-[80%] ${message.role === 'bot' ? 'bg-gradient-to-r from-[#38b6ff] to-[#7843e6] text-white' : 'bg-white'} overflow-hidden`}>
        <CardContent className="p-3">
          <p className="mb-1 text-sm md:text-base">{message.text}</p>
          {message.transliteration && (
            <p className="text-xs md:text-sm opacity-80 mb-1">{message.transliteration}</p>
          )}
          <AnimatePresence>
            {showTranslation && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs md:text-sm italic mb-2"
              >
                {message.translation}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="flex items-center justify-between gap-2 mt-2">
            <AudioPlayer audioUrl={message.tts_audio_url} label="Audio" />
            {message.role === 'user' && message.user_audio_url && (
              <AudioPlayer audioUrl={message.user_audio_url} label="Your Recording" showSpeedControl={false} />
            )}
            {message.role === 'user' && message.feedback && message.feedback.NBest && message.feedback.NBest.length > 0 && (
              <FeedbackModal feedback={message.feedback} />
            )}
            <Button size="sm" variant="ghost" className="p-0" onClick={() => setShowTranslation(!showTranslation)}>
              {showTranslation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChatBubble;