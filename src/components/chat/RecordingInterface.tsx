import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AudioPlayer from './AudioPlayer';

interface RecordingInterfaceProps {
  onRecordingComplete: (audioUrl: string, score: number) => void;
}

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({ onRecordingComplete }) => {
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

  const submitRecording = () => {
    if (audioUrl) {
      const score = Math.floor(Math.random() * 31) + 70; // Random score between 70 and 100 for demonstration
      onRecordingComplete(audioUrl, score);
      setAudioUrl(null);
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
      {audioUrl && (
        <Button
          onClick={submitRecording}
          className="mt-2 rounded-full hover:bg-opacity-80 transition-colors duration-200 border-2 border-[#38b6ff]"
        >
          Submit Recording
        </Button>
      )}
    </div>
  );
};

export default RecordingInterface;