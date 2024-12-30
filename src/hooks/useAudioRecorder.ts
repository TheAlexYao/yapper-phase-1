import { useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderConfig {
  preRollDelay?: number;
  postRollDelay?: number;
  chunkInterval?: number;
}

export const useAudioRecorder = (config: AudioRecorderConfig = {}) => {
  const {
    preRollDelay = 500,   // Increased from default
    postRollDelay = 300,  // Added post-roll delay
    chunkInterval = 500   // Reduced chunk interval for more frequent updates
  } = config;

  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const requestData = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.requestData();
      console.log('Requested data chunk');
    }
  };

  const cleanup = () => {
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
      chunkIntervalRef.current = undefined;
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear the media recorder
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      setIsPreparing(true);
      console.log('Preparing to record...');
      
      // Clean up any existing recording session
      cleanup();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
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
      cleanup();
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
          setIsRecording(false);
          
          // Cleanup after a short delay to ensure all data is captured
          setTimeout(() => {
            cleanup();
            setIsProcessing(false);
          }, 100);
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