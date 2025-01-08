import { TransliterationRules } from './types';

export const scandinavianRules: Partial<TransliterationRules> = {
  'sv-SE': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'tack', transliteration: 'tahk' },
      { original: 'kaffe', transliteration: 'kah-feh' },
      { original: 'tjugo', transliteration: 'shoo-goo' },
      { original: 'varm', transliteration: 'varm' },
      { original: 'hej då', transliteration: 'hey dow' }
    ]
  },
  'nb-NO': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'takk', transliteration: 'tahk' },
      { original: 'kaffe', transliteration: 'kah-feh' },
      { original: 'tjue', transliteration: 'shoo-eh' },
      { original: 'varm', transliteration: 'varm' },
      { original: 'ha det bra', transliteration: 'ha de bra' }
    ]
  }
};