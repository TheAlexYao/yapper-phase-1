import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Play, Pause, Turtle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AudioPlayerProps {
  audioUrl: string;
  label: string;
  showSpeedControl?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, label, showSpeedControl = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
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

interface RecordingControlsProps {
  onRecordingComplete: (audioUrl: string, audioBlob: Blob) => void;
  currentPrompt: {
    text: string;
    transliteration: string | null;
    translation: string;
    tts_audio_url: string;
  } | null;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ onRecordingComplete, currentPrompt }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob || !currentPrompt) return;
    
    setIsSubmitting(true);
    try {
      // Convert audio to WAV format with proper settings
      const audioContext = new AudioContext();
      const audioData = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      
      // Create WAV file with proper format
      const wavBlob = await convertToWav(audioBuffer);
      
      if (wavBlob.size > 1024 * 1024 * 10) { // 10MB limit
        throw new Error('Audio file too large. Please record a shorter message.');
      }

      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');
      formData.append('text', currentPrompt.text);
      formData.append('languageCode', 'es-ES'); // TODO: Make this dynamic based on selected language

      const { data, error } = await supabase.functions.invoke('assess-pronunciation', {
        body: formData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to assess pronunciation. Please try again.');
      }

      const { audioUrl: uploadedAudioUrl, assessment } = data;
      
      if (uploadedAudioUrl && assessment) {
        onRecordingComplete(uploadedAudioUrl, audioBlob);
        setAudioUrl(null);
        setAudioBlob(null);
      } else {
        throw new Error('Invalid response from pronunciation assessment');
      }
    } catch (error) {
      console.error('Error submitting recording:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assess pronunciation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to convert AudioBuffer to WAV format
  const convertToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeUTFBytes(view, 8, 'WAVE');
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const data = new Float32Array(audioBuffer.length * numOfChannels);
    let offset = 44;
    
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      data.set(audioBuffer.getChannelData(i), i * audioBuffer.length);
    }

    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const writeUTFBytes = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  if (!currentPrompt) return null;

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10 rounded-t-lg w-full">
      <div className="text-center">
        <p className="text-sm md:text-base mb-1">{currentPrompt.text}</p>
        {currentPrompt.transliteration && (
          <p className="text-xs md:text-sm text-gray-600">{currentPrompt.transliteration}</p>
        )}
      </div>

      <AudioPlayer audioUrl={currentPrompt.tts_audio_url} label="TTS" />

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
        className="rounded-full w-48 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 transition-opacity duration-200"
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
        <Mic className="ml-2 h-5 w-5" />
      </Button>

      {audioUrl && !isRecording && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="default"
          className="w-48 mt-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 transition-opacity duration-200"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Recording'}
        </Button>
      )}
    </div>
  );
};

export { RecordingControls, AudioPlayer };