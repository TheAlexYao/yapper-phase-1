import { TransliterationRules } from './types';
import { eastAsianRules } from './eastAsian';
import { southAsianRules } from './southAsian';
import { southeastAsianRules } from './southeastAsian';
import { europeanRules } from './european';
import { otherEuropeanRules } from './otherEuropean';
import { scandinavianRules } from './scandinavian';
import { LanguageCode } from '../languages';

export const TRANSLITERATION_RULES: TransliterationRules = {
  'en-US': {
    description: 'Native English, no transliteration needed',
    examples: []
  },
  'zh-HK': eastAsianRules['zh-HK']!,
  'nl-NL': scandinavianRules['nl-NL']!,
  'fr-FR': otherEuropeanRules['fr-FR']!,
  'fr-CA': otherEuropeanRules['fr-CA']!,
  'de-DE': europeanRules['de-DE']!,
  'hi-IN': southAsianRules['hi-IN']!,
  'it-IT': otherEuropeanRules['it-IT']!,
  'ja-JP': eastAsianRules['ja-JP']!,
  'ko-KR': eastAsianRules['ko-KR']!,
  'zh-CN': eastAsianRules['zh-CN']!,
  'zh-TW': eastAsianRules['zh-TW']!,
  'ms-MY': southeastAsianRules['ms-MY']!,
  'nb-NO': scandinavianRules['nb-NO']!,
  'pl-PL': scandinavianRules['pl-PL']!,
  'pt-PT': otherEuropeanRules['pt-PT']!,
  'pt-BR': otherEuropeanRules['pt-BR']!,
  'ru-RU': europeanRules['ru-RU']!,
  'es-ES': otherEuropeanRules['es-ES']!,
  'es-MX': otherEuropeanRules['es-MX']!,
  'sv-SE': scandinavianRules['sv-SE']!,
  'ta-IN': southAsianRules['ta-IN']!,
  'th-TH': southeastAsianRules['th-TH']!,
  'vi-VN': southeastAsianRules['vi-VN']!
};

export const getTransliterationRules = (languageCode: LanguageCode) => {
  return TRANSLITERATION_RULES[languageCode] || {
    description: 'No specific transliteration rules available',
    examples: []
  };
};