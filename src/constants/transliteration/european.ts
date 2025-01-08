import { TransliterationRules } from './types';

export const europeanRules: Partial<TransliterationRules> = {
  'ru-RU': {
    description: 'Break words into syllables, use English approximations',
    examples: [
      { original: 'здравствуйте', transliteration: 'zdrah-stvooy-tye' },
      { original: 'спасибо', transliteration: 'spah-see-bah' },
      { original: 'кофе', transliteration: 'koh-fye' },
      { original: 'двадцать', transliteration: 'dvad-tsat' },
      { original: 'горячий', transliteration: 'go-rya-chiy' },
      { original: 'до свидания', transliteration: 'do-svee-dah-nee-ya' }
    ]
  },
  'de-DE': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'danke', transliteration: 'dahn-kuh' },
      { original: 'kaffee', transliteration: 'kah-feh' },
      { original: 'zwanzig', transliteration: 'tsvahn-tsig' },
      { original: 'heiß', transliteration: 'hays' },
      { original: 'auf wiedersehen', transliteration: 'owf vee-der-zey-en' }
    ]
  }
};