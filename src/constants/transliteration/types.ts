import { LanguageCode } from '../languages';

export type TransliterationExample = {
  original: string;
  transliteration: string;
};

export type LanguageTransliterationRules = {
  description: string;
  examples: TransliterationExample[];
};

export type TransliterationRules = Record<LanguageCode, LanguageTransliterationRules>;