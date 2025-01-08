import { TransliterationRules } from './types';

export const eastAsianRules: Partial<TransliterationRules> = {
  'zh-CN': {
    description: 'Break words into syllables with hyphens, use English letter combinations that match the sound',
    examples: [
      { original: '你好', transliteration: 'nee-how' },
      { original: '谢谢', transliteration: 'shyeh-shyeh' },
      { original: '咖啡', transliteration: 'kah-fey' },
      { original: '热的', transliteration: 'reh duh' },
      { original: '二十', transliteration: 'ar-shur' },
      { original: '请问', transliteration: 'ching-wen' },
      { original: '再见', transliteration: 'tsai-jyen' }
    ]
  },
  'zh-TW': {
    description: 'Break words into syllables with hyphens, use English letter combinations that match the sound',
    examples: [
      { original: '你好', transliteration: 'nee-how' },
      { original: '謝謝', transliteration: 'shyeh-shyeh' },
      { original: '咖啡', transliteration: 'kah-fey' },
      { original: '熱的', transliteration: 'reh duh' },
      { original: '二十', transliteration: 'ar-shur' },
      { original: '請問', transliteration: 'ching-wen' },
      { original: '再見', transliteration: 'tsai-jyen' }
    ]
  },
  'zh-HK': {
    description: 'Break Cantonese words into syllables with hyphens',
    examples: [
      { original: '你好', transliteration: 'nay-how' },
      { original: '唔該', transliteration: 'mm-goy' },
      { original: '咖啡', transliteration: 'gah-fey' },
      { original: '二十', transliteration: 'yee-sup' },
      { original: '熱', transliteration: 'yiht' },
      { original: '再見', transliteration: 'joy-gin' }
    ]
  },
  'ja-JP': {
    description: 'Break words into syllables with hyphens, use English letter combinations that match the sound',
    examples: [
      { original: 'こんにちは', transliteration: 'kohn-nee-chee-wah' },
      { original: 'ありがとう', transliteration: 'ah-ree-gah-toh' },
      { original: 'コーヒー', transliteration: 'koh-hee' },
      { original: '二千円', transliteration: 'nee-sen yen' },
      { original: 'お願いします', transliteration: 'oh-neh-gai-shi-mas' },
      { original: 'さようなら', transliteration: 'sah-yoh-nah-rah' }
    ]
  },
  'ko-KR': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: '안녕하세요', transliteration: 'ahn-nyong-ha-say-yo' },
      { original: '감사합니다', transliteration: 'gam-sah-ham-nee-da' },
      { original: '커피', transliteration: 'kuh-pee' },
      { original: '이만원', transliteration: 'ee-man-won' },
      { original: '주세요', transliteration: 'joo-say-yo' },
      { original: '안녕히가세요', transliteration: 'ahn-nyong-hee-gah-say-yo' }
    ]
  }
};