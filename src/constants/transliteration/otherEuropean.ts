import { TransliterationRules } from './types';

export const otherEuropeanRules: Partial<TransliterationRules> = {
  'fr-FR': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'merci', transliteration: 'mair-see' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'vingt', transliteration: 'van' },
      { original: 'chaud', transliteration: 'show' },
      { original: 'au revoir', transliteration: 'oh-ruh-vwar' }
    ]
  },
  'fr-CA': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'merci', transliteration: 'mair-see' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'vingt', transliteration: 'van' },
      { original: 'chaud', transliteration: 'show' },
      { original: 'au revoir', transliteration: 'oh-ruh-vwar' }
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
  'pt-BR': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'obrigado', transliteration: 'oh-bree-gah-doo' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'vinte', transliteration: 'veen-chee' }
    ]
  },
  'pt-PT': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'obrigado', transliteration: 'oh-bree-gah-doo' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'vinte', transliteration: 'veen-chee' }
    ]
  }
};