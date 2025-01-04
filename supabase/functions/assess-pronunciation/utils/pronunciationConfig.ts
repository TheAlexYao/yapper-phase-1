import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"

interface PronunciationConfigOptions {
  tonal: boolean;
  maxDuration: number;
  minDuration: number;
  fluencyWeight: number;
  accuracyWeight: number;
  wordSegmentation: boolean;
  completenessWeight: number;
}

export function createPronunciationConfig(
  referenceText: string,
  options: PronunciationConfigOptions
): sdk.PronunciationAssessmentConfig {
  const config = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Word,
    options.wordSegmentation
  );

  // Apply language-specific settings
  if (options.tonal) {
    config.enableProsodyAssessment = true;
  }

  return config;
}