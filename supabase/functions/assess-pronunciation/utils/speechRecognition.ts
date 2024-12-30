import { SpeechConfig, AudioConfig, PronunciationAssessment, PronunciationAssessmentConfig, SpeechRecognizer } from "microsoft-cognitiveservices-speech-sdk";

export async function performSpeechRecognition(audioData: ArrayBuffer, referenceText: string) {
  const speechConfig = SpeechConfig.fromSubscription(
    Deno.env.get("AZURE_SPEECH_KEY") || "",
    Deno.env.get("AZURE_SPEECH_REGION") || ""
  );
  
  // Set pronunciation assessment configuration
  const pronunciationConfig = new PronunciationAssessmentConfig(
    referenceText,
    PronunciationAssessment.GradingSystem.HundredMark,
    PronunciationAssessment.Granularity.Word,
    true
  );

  const audioConfig = AudioConfig.fromWavFileInput(audioData);
  const recognizer = new SpeechRecognizer(speechConfig);
  
  // Apply pronunciation assessment config to the recognizer
  PronunciationAssessment.applyTo(recognizer);
  
  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(
      async (result) => {
        if (result.errorDetails) {
          reject(new Error(result.errorDetails));
          return;
        }

        const pronunciationAssessmentResult = PronunciationAssessment.getAssessmentResultFromResult(result);
        
        // Get detailed word-level assessment
        const wordLevelDetails = pronunciationAssessmentResult.detailedResults.map(word => ({
          Word: word.word,
          PronunciationAssessment: {
            AccuracyScore: word.accuracyScore,
            ErrorType: word.errorType
          }
        }));

        resolve({
          NBest: [{
            PronunciationAssessment: {
              AccuracyScore: pronunciationAssessmentResult.accuracyScore,
              FluencyScore: pronunciationAssessmentResult.fluencyScore,
              CompletenessScore: pronunciationAssessmentResult.completenessScore,
              PronScore: pronunciationAssessmentResult.pronunciationScore
            },
            Words: wordLevelDetails
          }],
          overallScore: pronunciationAssessmentResult.pronunciationScore,
          suggestions: generateSuggestions(pronunciationAssessmentResult)
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

function generateSuggestions(result: any) {
  const suggestions = [];
  
  if (result.accuracyScore < 80) {
    suggestions.push("Focus on pronouncing each word clearly and correctly.");
  }
  if (result.fluencyScore < 80) {
    suggestions.push("Try to speak more smoothly and naturally.");
  }
  if (result.completenessScore < 80) {
    suggestions.push("Make sure to pronounce all parts of each word.");
  }
  
  return suggestions.join(" ");
}