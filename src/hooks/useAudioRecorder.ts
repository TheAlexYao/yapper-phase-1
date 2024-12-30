import { useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderConfig {
  preRollDelay?: number;
  postRollDelay?: number;
  chunkInterval?: number;
}

export const useAudioRecorder = (config: AudioRecorderConfig = {}) => {
  const {
    preRollDelay = 500,
    postRollDelay = 300,
    chunkInterval = 500
  } = config;

  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<number>();
  const { toast } = useToast();

  const requestData = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.requestData();
      console.log('Requested data chunk');
    }
  };

  const startRecording = async () => {
    try {
      setIsPreparing(true);
      console.log('Preparing to record...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log('Data chunk received:', e.data.size, 'bytes');
          chunksRef.current.push(e.data);
        }
      };

      // Start the actual recording after pre-roll delay
      setTimeout(() => {
        console.log('Starting recording...');
        mediaRecorder.start();
        setIsPreparing(false);
        setIsRecording(true);

        // Set up regular data requests
        chunkIntervalRef.current = window.setInterval(requestData, chunkInterval);
      }, preRollDelay);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsPreparing(false);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsProcessing(true);
      console.log('Processing final recording...');

      // Clear the chunk request interval
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }

      // Add post-roll delay before stopping
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          setIsProcessing(false);
        }
      }, postRollDelay);
    }
  };

  const getRecordingBlob = () => {
    if (chunksRef.current.length === 0) return null;
    console.log(`Creating blob from ${chunksRef.current.length} chunks`);
    return new Blob(chunksRef.current, { type: 'audio/webm' });
  };

  return {
    isRecording,
    isPreparing,
    isProcessing,
    startRecording,
    stopRecording,
    getRecordingBlob
  };
};