import { TransliterationRules } from './types';

export const southAsianRules: Partial<TransliterationRules> = {
  'hi-IN': {
    description: 'Break words into syllables, use familiar English sounds as reference',
    examples: [
      { original: 'नमस्ते', transliteration: 'nuh-muh-stay' },
      { original: 'धन्यवाद', transliteration: 'dun-yuh-vahd' },
      { original: 'कॉफ़ी', transliteration: 'koh-fee' },
      { original: 'बीस', transliteration: 'bees' },
      { original: 'गरम', transliteration: 'guh-rum' },
      { original: 'फिर मिलेंगे', transliteration: 'fir mee-len-gay' }
    ]
  },
  'ta-IN': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'வணக்கம்', transliteration: 'vuh-nuh-kum' },
      { original: 'நன்றி', transliteration: 'nun-dree' },
      { original: 'காபி', transliteration: 'kah-pee' },
      { original: 'இருபது', transliteration: 'ee-ru-buh-thu' },
      { original: 'சூடான', transliteration: 'soo-dah-nuh' },
      { original: 'பிறகு பார்க்கலாம்', transliteration: 'pi-ra-gu paar-kuh-laam' }
    ]
  }
};