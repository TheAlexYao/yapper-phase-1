import { 
  SpeechConfig, 
  AudioConfig, 
  PronunciationAssessment, 
  PronunciationAssessmentConfig, 
  SpeechRecognizer,
  AudioStreamFormat
} from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0";

interface SpeechRecognitionParams {
  speechKey: string;
  speechRegion: string;
  languageCode: string;
  referenceText: string;
  audioData: ArrayBuffer;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

export async function performSpeechRecognition(params: SpeechRecognitionParams) {
  console.log("Starting speech recognition with params:", {
    ...params,
    speechKey: '***',
    audioData: `${params.audioData.byteLength} bytes`
  });

  const speechConfig = SpeechConfig.fromSubscription(params.speechKey, params.speechRegion);
  speechConfig.speechRecognitionLanguage = params.languageCode;

  // Configure pronunciation assessment
  const pronunciationConfig = new PronunciationAssessmentConfig(
    params.referenceText,
    PronunciationAssessment.GradingSystem.HundredMark,
    PronunciationAssessment.Granularity.Word,
    true
  );

  // Create audio format
  const format = AudioStreamFormat.getWaveFormatPCM(
    params.sampleRate,
    params.bitsPerSample,
    params.channels
  );

  // Create audio config from PCM data
  const audioConfig = AudioConfig.fromStreamInput(params.audioData, format);
  
  // Create recognizer and apply pronunciation assessment
  const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
  PronunciationAssessment.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    console.log("Starting recognition process...");
    
    recognizer.recognizeOnceAsync(
      result => {
        if (result.errorDetails) {
          console.error("Recognition error:", result.errorDetails);
          reject(new Error(result.errorDetails));
          return;
        }

        console.log("Recognition successful, processing results");
        resolve(result);
      },
      error => {
        console.error("Recognition error:", error);
        reject(error);
      }
    );
  });
}