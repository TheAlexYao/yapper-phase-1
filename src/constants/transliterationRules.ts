import { LanguageCode } from './languages';

type TransliterationExample = {
  original: string;
  transliteration: string;
};

type LanguageTransliterationRules = {
  description: string;
  examples: TransliterationExample[];
};

export const TRANSLITERATION_RULES: Record<LanguageCode, LanguageTransliterationRules> = {
  'zh-CN': {
    description: 'Break words into syllables with hyphens, use English letter combinations that match the sound',
    examples: [
      { original: '你好', transliteration: 'nee-how' },
      { original: '谢谢', transliteration: 'shyeh-shyeh' },
      { original: '咖啡', transliteration: 'kah-fey' },
      { original: '热的', transliteration: 'reh duh' },
      { original: '二十', transliteration: 'ar-shur' }
    ]
  },
  'zh-HK': {
    description: 'Break Cantonese words into syllables with hyphens',
    examples: [
      { original: '你好', transliteration: 'nay-how' },
      { original: '唔該', transliteration: 'mm-goy' },
      { original: '咖啡', transliteration: 'gah-fey' },
      { original: '二十', transliteration: 'yee-sup' }
    ]
  },
  'ja-JP': {
    description: 'Break words into syllables with hyphens, use English letter combinations that match the sound',
    examples: [
      { original: 'こんにちは', transliteration: 'kohn-nee-chee-wah' },
      { original: 'ありがとう', transliteration: 'ah-ree-gah-toh' },
      { original: 'コーヒー', transliteration: 'koh-hee' },
      { original: '二千円', transliteration: 'nee-sen yen' }
    ]
  },
  'ko-KR': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: '안녕하세요', transliteration: 'ahn-nyong-ha-say-yo' },
      { original: '감사합니다', transliteration: 'gam-sah-ham-nee-da' },
      { original: '커피', transliteration: 'kuh-pee' }
    ]
  },
  'hi-IN': {
    description: 'Break words into syllables, use familiar English sounds as reference',
    examples: [
      { original: 'नमस्ते', transliteration: 'nuh-muh-stay' },
      { original: 'धन्यवाद', transliteration: 'dun-yuh-vahd' },
      { original: 'कॉफ़ी', transliteration: 'koh-fee' }
    ]
  },
  'ta-IN': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'வணக்கம்', transliteration: 'vuh-nuh-kum' },
      { original: 'நன்றி', transliteration: 'nun-dree' },
      { original: 'காபி', transliteration: 'kah-pee' }
    ]
  },
  'th-TH': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'สวัสดี', transliteration: 'sah-wah-dee' },
      { original: 'ขอบคุณ', transliteration: 'kop-kun' },
      { original: 'กาแฟ', transliteration: 'gah-fae' }
    ]
  },
  'vi-VN': {
    description: 'Break words into syllables, maintain tonal indications',
    examples: [
      { original: 'xin chào', transliteration: 'sin chow' },
      { original: 'cảm ơn', transliteration: 'kam uhn' },
      { original: 'cà phê', transliteration: 'kah feh' }
    ]
  },
  'ms-MY': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'terima kasih', transliteration: 'tuh-ree-mah kah-see' },
      { original: 'kopi', transliteration: 'koh-pee' },
      { original: 'dua puluh', transliteration: 'doo-ah poo-loo' }
    ]
  },
  'ru-RU': {
    description: 'Break words into syllables, use English approximations',
    examples: [
      { original: 'здравствуйте', transliteration: 'zdrah-stvooy-tye' },
      { original: 'спасибо', transliteration: 'spah-see-bah' },
      { original: 'кофе', transliteration: 'koh-fye' }
    ]
  },
  'de-DE': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'danke', transliteration: 'dahn-kuh' },
      { original: 'kaffee', transliteration: 'kah-feh' },
      { original: 'zwanzig', transliteration: 'tsvahn-tsig' }
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
  },
  'es-ES': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'gracias', transliteration: 'grah-syahs' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'veinte', transliteration: 'vey-n-teh' }
    ]
  },
  'es-MX': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'gracias', transliteration: 'grah-syahs' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'veinte', transliteration: 'vey-n-teh' }
    ]
  },
  'fr-FR': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'merci', transliteration: 'mair-see' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'vingt', transliteration: 'van' }
    ]
  },
  'fr-CA': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'merci', transliteration: 'mair-see' },
      { original: 'café', transliteration: 'kah-feh' },
      { original: 'vingt', transliteration: 'van' }
    ]
  },
  'it-IT': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'grazie', transliteration: 'grah-tsee-eh' },
      { original: 'caffè', transliteration: 'kah-feh' },
      { original: 'venti', transliteration: 'ven-tee' }
    ]
  },
  'nl-NL': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'dank je', transliteration: 'dahnk yuh' },
      { original: 'koffie', transliteration: 'koh-fee' },
      { original: 'twintig', transliteration: 'tvin-tug' }
    ]
  },
  'pl-PL': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'dziękuję', transliteration: 'jen-koo-yeh' },
      { original: 'kawa', transliteration: 'kah-vah' },
      { original: 'dwadzieścia', transliteration: 'dvah-yesh-cha' }
    ]
  },
  'sv-SE': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'tack', transliteration: 'tahk' },
      { original: 'kaffe', transliteration: 'kah-feh' },
      { original: 'tjugo', transliteration: 'shoo-goo' }
    ]
  },
  'nb-NO': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'takk', transliteration: 'tahk' },
      { original: 'kaffe', transliteration: 'kah-feh' },
      { original: 'tjue', transliteration: 'shoo-eh' }
    ]
  },
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