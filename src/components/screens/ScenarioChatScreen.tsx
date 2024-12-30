'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Mic, Play, Pause, ChevronDown, ChevronUp, Volume2, Info, ChevronRight, Turtle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostScenarioSummary from './PostScenarioSummary';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  transliteration: string | null;
  translation: string;
  tts_audio_url: string;
  user_audio_url: string | null;
  score: number | null;
  feedback?: {
    overall_score: number;
    phoneme_analysis: string;
    word_scores: { [word: string]: number };
    suggestions: string;
    NBest?: Array<{
      PronunciationAssessment: {
        AccuracyScore: number;
        FluencyScore: number;
        CompletenessScore: number;
        PronScore: number;
      };
      Words: Array<{
        Word: string;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
    }>;
  };
}

interface BotMessage extends ChatMessage {
  role: 'bot';
}

interface UserMessage extends ChatMessage {
  role: 'user';
  feedback: NonNullable<ChatMessage['feedback']>;
}

interface Script {
  id: string;
  language_code: string;
  scenario_id: number;
  topic_id: number;
  character_id: number;
  user_gender: 'male' | 'female';
  script_data: {
    languageCode: string;
    lines: Array<{
      lineNumber: number;
      speaker: 'character' | 'user';
      targetText: string;
      transliteration: string | null;
      translation: string;
      audioUrl: string | null;
    }>;
  };
  audio_generated: boolean;
  created_at?: string;
  updated_at?: string;
  transliteration?: string | null;
}

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

const AudioPlayer: React.FC<{ audioUrl: string; label: string; showSpeedControl?: boolean }> = ({ audioUrl, label, showSpeedControl = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
      }
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border rounded px-2 py-1"
        onClick={togglePlayback}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        <span className="text-xs font-medium">{label === "TTS" ? "Audio" : label}</span>
      </Button>
      {showSpeedControl && (
        <Button
          variant="outline"
          size="sm"
          className="border rounded p-1"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.playbackRate = 0.7;
              audioRef.current.play();
            }
          }}
        >
          <Turtle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const FeedbackModal: React.FC<{ feedback: UserMessage['feedback'] }> = ({ feedback }) => {
  if (!feedback || !feedback.NBest || feedback.NBest.length === 0) {
    return null;
  }

  const nBest = feedback.NBest[0];
  const pronAssessment = nBest.PronunciationAssessment;
  const words = nBest.Words || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="mt-2 hover:bg-opacity-80 transition-colors duration-200">
          <Info className="h-4 w-4 mr-2" />
          Score: {pronAssessment.PronScore}%
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border shadow-lg">
        <DialogHeader>
          <DialogTitle>Pronunciation Feedback</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 font-semibold">Accuracy</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pronAssessment.AccuracyScore}%` }}></div>
              </div>
              <p className="mt-1 text-sm">{pronAssessment.AccuracyScore}%</p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Fluency</h4>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pronAssessment.FluencyScore}%` }}></div>
              </div>
              <p className="mt-1 text-sm">{pronAssessment.FluencyScore}%</p>
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Word Analysis:</h4>
            <ul className="grid gap-2">
              {words.map((word, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-sm">{word.Word}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${word.PronunciationAssessment.AccuracyScore}%` }}></div>
                    </div>
                    {word.PronunciationAssessment.ErrorType !== 'none' && (
                      <span className="text-xs text-destructive">{word.PronunciationAssessment.ErrorType}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
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

const RecordingInterface: React.FC<{
  onRecordingComplete: (audioUrl: string, audioBlob: Blob) => void;
}> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(url, blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10 rounded-t-lg w-full">
      {audioUrl && (
        <div className="mb-2 w-full flex justify-center">
          <AudioPlayer audioUrl={audioUrl} label="Your Recording" showSpeedControl={false} />
        </div>
      )}
      {isRecording && (
        <div className="h-8 bg-gray-200 rounded-full overflow-hidden w-48 mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )}
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant={isRecording ? "destructive" : "default"}
        className="rounded-full w-48 hover:bg-opacity-80 transition-colors duration-200 border-2 border-[#38b6ff]"
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
        <Mic className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

const ScenarioChatScreen: React.FC<ScenarioChatScreenProps> = ({
  scenarioId,
  scenarioTitle,
  characterName,
  onBackToCharacters,
  script
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<BotMessage | null>(null);
  const [scriptLines, setScriptLines] = useState<ChatMessage[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState(Date.now());
  const [isConversationComplete, setIsConversationComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { toast } = useToast();

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
    setConversationStartTime(Date.now());
  }, [script]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const assessPronunciation = async (audioBlob: Blob, targetText: string): Promise<{
    score: number;
    feedback: any;
  }> => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('targetText', targetText);

      const { data: assessmentData, error } = await supabase.functions.invoke('assess-pronunciation', {
        body: formData,
      });

      if (error) {
        console.error('Error assessing pronunciation:', error);
        throw error;
      }

      console.log('Pronunciation assessment result:', assessmentData);
      return {
        score: assessmentData.score,
        feedback: assessmentData.feedback
      };
    } catch (err) {
      console.error('Error in pronunciation assessment:', err);
      throw err;
    }
  };

  const handleRecordingComplete = async (audioUrl: string, audioBlob: Blob) => {
    if (currentPrompt) {
      try {
        const { score, feedback } = await assessPronunciation(audioBlob, currentPrompt.text);

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
            phoneme_analysis: feedback.phonemeAnalysis || "",
            word_scores: feedback.wordScores || {},
            suggestions: feedback.suggestions || "",
            NBest: [{
              PronunciationAssessment: {
                AccuracyScore: feedback.accuracyScore || 0,
                FluencyScore: feedback.fluencyScore || 0,
                CompletenessScore: feedback.completenessScore || 0,
                PronScore: score
              },
              Words: feedback.words || []
            }]
          }
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);
        setCurrentPrompt(null);

        if (currentLineIndex < scriptLines.length) {
          const nextLine = scriptLines[currentLineIndex];
          
          setTimeout(() => {
            if (nextLine.role === 'bot') {
              setMessages(prevMessages => [...prevMessages, nextLine]);
              setCurrentLineIndex(prevIndex => prevIndex + 1);
              
              const nextUserPrompt = scriptLines.slice(currentLineIndex + 1).find(line => line.role === 'user');
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
          }, 1000);
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

  const handleViewSummary = () => {
    setShowSummary(true);
  };

  const handleRestartScenario = () => {
    setShowSummary(false);
    setMessages([]);
    setCurrentPrompt(null);
    setIsConversationEnded(false);
    setIsConversationComplete(false);
    setConversationStartTime(Date.now());
  };

  const handleNextScenario = () => {
    console.log("Moving to next scenario");
  };

  const calculateAverageScore = () => {
    const userMessages = messages.filter(message => message.role === 'user' && message.score !== null);
    if (userMessages.length === 0) return 0;
    const totalScore = userMessages.reduce((sum, message) => sum + (message.score || 0), 0);
    return totalScore / userMessages.length;
  };

  const ConversationEndUI: React.FC<{ onSummary: () => void }> = ({ onSummary }) => (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t p-4 flex flex-col items-center space-y-4">
      <h3 className="text-xl font-bold text-center">Conversation Complete!</h3>
      <p className="text-center text-gray-600">Great job! You've completed this conversation scenario.</p>
      <Button onClick={onSummary}>View Summary</Button>
    </div>
  );

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
        onRestart={handleRestartScenario}
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
        <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-800 hover:bg-opacity-80 transition-colors duration-200"
            onClick={onBackToCharacters}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-center flex-grow">
            Chat with {characterName}: {scenarioTitle}
          </h1>
          <div className="w-10"></div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-white/80">
          <AnimatePresence>
            {messages.map(message => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {isConversationComplete ? (
          <ConversationEndUI onSummary={handleViewSummary} />
        ) : (
          currentPrompt && (
            <div className="border-t bg-white flex flex-col items-center w-full">
              <div className="p-4 w-full flex flex-col items-center">
                <h3 className="font-semibold mb-2 text-center">Your turn:</h3>
                <p className="text-sm md:text-base text-center">{currentPrompt.text}</p>
                <p className="text-xs md:text-sm text-gray-600 mt-1 text-center">{currentPrompt.transliteration}</p>
                <div className="mt-2 flex flex-col items-center gap-2">
                  <AudioPlayer audioUrl={currentPrompt.tts_audio_url} label="TTS" />
                  <RecordingInterface onRecordingComplete={handleRecordingComplete} />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ScenarioChatScreen;
