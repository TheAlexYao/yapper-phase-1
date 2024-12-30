import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { convertToWav, createAzureCompatibleWav } from '@/utils/audioConversion';
import { AudioPlayer } from '@/components/audio/AudioPlayer';

interface RecordingControlsProps {
  onRecordingComplete: (audioUrl: string, audioBlob: Blob) => void;
  currentPrompt: {
    text: string;
    transliteration: string | null;
    translation: string;
    tts_audio_url: string;
  } | null;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  onRecordingComplete,
  currentPrompt
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const {
    isRecording,
    isPreparing,
    isProcessing,
    startRecording,
    stopRecording,
    getRecordingBlob
  } = useAudioRecorder({
    preRollDelay: 500,
    postRollDelay: 300,
    chunkInterval: 500
  });

  const handleSubmit = async () => {
    const audioBlob = getRecordingBlob();
    if (!audioBlob || !currentPrompt) return;
    
    setIsSubmitting(true);
    try {
      console.log('Starting audio processing...');
      const audioContext = new AudioContext();
      const audioData = await audioBlob.arrayBuffer();
      console.log('Audio data size:', audioData.byteLength, 'bytes');
      
      const audioBuffer = await audioContext.decodeAudioData(audioData);
      console.log('Audio decoded:', {
        duration: audioBuffer.duration,
        numberOfChannels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate
      });
      
      // Create Azure-compatible WAV (16kHz) for assessment
      const azureWavBlob = await createAzureCompatibleWav(audioBuffer);
      console.log('Azure WAV conversion complete. Size:', azureWavBlob.size, 'bytes');
      
      if (azureWavBlob.size > 1024 * 1024 * 10) {
        throw new Error('Audio file too large. Please record a shorter message.');
      }

      const formData = new FormData();
      formData.append('audio', azureWavBlob, 'recording.wav');
      formData.append('text', currentPrompt.text);
      formData.append('languageCode', 'es-ES');

      const { data, error } = await supabase.functions.invoke('assess-pronunciation', {
        body: formData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to assess pronunciation. Please try again.');
      }

      if (!data?.assessment?.NBest?.[0]) {
        console.error('Invalid assessment data:', data);
        throw new Error('Invalid response from pronunciation assessment');
      }

      // Create high-quality WAV for playback
      const highQualityWav = await convertToWav(audioBuffer);
      const newAudioUrl = URL.createObjectURL(highQualityWav);
      onRecordingComplete(newAudioUrl, azureWavBlob);
      setAudioUrl(null);
      
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

  const handleStopRecording = async () => {
    await stopRecording();
    const blob = getRecordingBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
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

      <div className="flex gap-2">
        <Button
          onClick={isRecording ? handleStopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          className="rounded-full w-48 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 transition-opacity duration-200"
          disabled={isPreparing || isProcessing}
        >
          {isPreparing ? 'Preparing...' : 
           isProcessing ? 'Processing...' :
           isRecording ? 'Stop Recording' : 'Start Recording'}
          <Mic className="ml-2 h-5 w-5" />
        </Button>

        {audioUrl && !isRecording && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="default"
            className="rounded-full w-48 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90 transition-opacity duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
            <Send className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};