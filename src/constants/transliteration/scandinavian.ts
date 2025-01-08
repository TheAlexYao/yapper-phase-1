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
  },
  'nl-NL': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'dank je', transliteration: 'dahnk yuh' },
      { original: 'koffie', transliteration: 'koh-fee' },
      { original: 'twintig', transliteration: 'tvin-tug' },
      { original: 'heet', transliteration: 'hayt' },
      { original: 'tot ziens', transliteration: 'tot zeens' }
    ]
  },
  'pl-PL': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'dziękuję', transliteration: 'jen-koo-yeh' },
      { original: 'kawa', transliteration: 'kah-vah' },
      { original: 'dwadzieścia', transliteration: 'dvah-yesh-cha' }
    ]
  }
};