import { TransliterationRules } from './types';

export const southeastAsianRules: Partial<TransliterationRules> = {
  'th-TH': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'สวัสดี', transliteration: 'sah-wah-dee' },
      { original: 'ขอบคุณ', transliteration: 'kop-kun' },
      { original: 'กาแฟ', transliteration: 'gah-fae' },
      { original: 'ยี่สิบ', transliteration: 'yee-sip' },
      { original: 'ร้อน', transliteration: 'rawn' },
      { original: 'แล้วพบกันใหม่', transliteration: 'laew-pop-gun-mai' }
    ]
  },
  'vi-VN': {
    description: 'Break words into syllables, maintain tonal indications',
    examples: [
      { original: 'xin chào', transliteration: 'sin chow' },
      { original: 'cảm ơn', transliteration: 'kam uhn' },
      { original: 'cà phê', transliteration: 'kah feh' },
      { original: 'hai mươi', transliteration: 'hai muh-oy' },
      { original: 'nóng', transliteration: 'nawm' },
      { original: 'tạm biệt', transliteration: 'tam bee-et' }
    ]
  },
  'ms-MY': {
    description: 'Break words into syllables with hyphens',
    examples: [
      { original: 'terima kasih', transliteration: 'tuh-ree-mah kah-see' },
      { original: 'kopi', transliteration: 'koh-pee' },
      { original: 'dua puluh', transliteration: 'doo-ah poo-loo' },
      { original: 'panas', transliteration: 'pah-nas' },
      { original: 'jumpa lagi', transliteration: 'joom-pah lah-gee' }
    ]
  }
};