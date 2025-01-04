import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk@1.32.0"

export interface LanguageConfig {
  pronunciation_config: {
    tonal: boolean;
    maxDuration: number;
    minDuration: number;
    fluencyWeight: number;
    accuracyWeight: number;
    wordSegmentation: boolean;
    completenessWeight: number;
  };
}

export function createPronunciationConfig(
  referenceText: string, 
  languageCode: string
): sdk.PronunciationAssessmentConfig {
  const config = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Word,
    true
  );

  // Add language-specific settings
  if (languageCode === 'ru-RU') {
    config.enableProsodyAssessment = true;
  }

  return config;
}