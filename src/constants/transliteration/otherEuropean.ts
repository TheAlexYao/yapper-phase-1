import { TransliterationRules } from './types';

export const otherEuropeanRules: Partial<TransliterationRules> = {
  'es-ES': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'gracias', transliteration: 'grah-syahs' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'veinte', transliteration: 'vey-n-teh' },
      { original: 'caliente', transliteration: 'kah-lee-en-teh' },
      { original: 'hasta luego', transliteration: 'ah-stah loo-eh-go' }
    ]
  },
  'es-MX': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'gracias', transliteration: 'grah-syahs' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'veinte', transliteration: 'vey-n-teh' },
      { original: 'caliente', transliteration: 'kah-lee-en-teh' },
      { original: 'hasta luego', transliteration: 'ah-stah loo-eh-go' }
    ]
  },
  'it-IT': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'grazie', transliteration: 'grah-tsee-eh' },
      { original: 'caffè', transliteration: 'kah-feh' },
      { original: 'venti', transliteration: 'ven-tee' },
      { original: 'caldo', transliteration: 'kahl-doh' },
      { original: 'arrivederci', transliteration: 'ah-ree-veh-dair-chee' }
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
  }
};