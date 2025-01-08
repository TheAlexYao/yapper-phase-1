import { TransliterationRules, LanguageTransliterationRules } from './types';
import { eastAsianRules } from './eastAsian';
import { southAsianRules } from './southAsian';
import { southeastAsianRules } from './southeastAsian';
import { europeanRules } from './european';
import { otherEuropeanRules } from './otherEuropean';
import { scandinavianRules } from './scandinavian';
import { LanguageCode } from '../languages';

export const TRANSLITERATION_RULES: TransliterationRules = {
  ...eastAsianRules,
  ...southAsianRules,
  ...southeastAsianRules,
  ...europeanRules,
  ...otherEuropeanRules,
  ...scandinavianRules,
  'en-US': {
    description: 'Native English, no transliteration needed',
    examples: []
  }
};

export const getTransliterationRules = (languageCode: LanguageCode): LanguageTransliterationRules => {
  return TRANSLITERATION_RULES[languageCode] || {
    description: 'No specific transliteration rules available',
    examples: []
  };
};