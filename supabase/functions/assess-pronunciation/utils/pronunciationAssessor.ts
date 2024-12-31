import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0";
import { segmentThaiText, mapSegmentedResultsToOriginal, SegmentationResult } from './thaiTextProcessor.ts';

export async function assessPronunciation(
  audioData: ArrayBuffer,
  referenceText: string,
  languageCode: string,
  pronunciationConfig: any
): Promise<{ result: sdk.SpeechRecognitionResult; segmentation?: SegmentationResult }> {
  // Only segment Thai text
  const shouldSegment = languageCode.toLowerCase().startsWith('th');
  let textSegmentation: SegmentationResult | undefined;
  let textToAssess = referenceText;

  if (shouldSegment) {
    textSegmentation = segmentThaiText(referenceText);
    textToAssess = textSegmentation.segmentedText;
    console.log('Segmented text:', textToAssess);
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    Deno.env.get('AZURE_SPEECH_KEY') || '',
    Deno.env.get('AZURE_SPEECH_REGION') || ''
  );
  speechConfig.speechRecognitionLanguage = languageCode;

  // Configure pronunciation assessment
  const assessmentConfig = new sdk.PronunciationAssessmentConfig(
    textToAssess,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Word,
    true
  );

  // Create audio stream
  const pushStream = sdk.AudioInputStream.createPushStream();
  const audioArray = new Uint8Array(audioData);
  const chunkSize = 32 * 1024;
  
  for (let i = 0; i < audioArray.length; i += chunkSize) {
    const chunk = audioArray.slice(i, i + chunkSize);
    pushStream.write(chunk);
  }
  pushStream.close();

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  assessmentConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizing = (s, e) => {
      console.log(`Recognition in progress: ${e.result.text}`);
    };

    recognizer.recognized = (s, e) => {
      console.log('Recognition result:', e.result);
      resolve({ result: e.result, segmentation: textSegmentation });
    };

    recognizer.canceled = (s, e) => {
      console.error('Recognition canceled:', e);
      reject(new Error(`Recognition canceled: ${e.errorDetails}`));
    };

    recognizer.recognizeOnceAsync(
      result => {
        recognizer.close();
        resolve({ result, segmentation: textSegmentation });
      },
      error => {
        console.error('Recognition error:', error);
        recognizer.close();
        reject(error);
      }
    );
  });
}