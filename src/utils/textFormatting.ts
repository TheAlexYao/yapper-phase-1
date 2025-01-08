import { LanguageCode } from '@/constants/languages';

export const formatTargetText = (text: string, languageCode: LanguageCode): string => {
  // Remove extra spaces first
  let formattedText = text.trim().replace(/\s+/g, ' ');

  switch (languageCode) {
    case 'th-TH':
      // Thai: Add spaces between each word unit
      // Keep existing spaces but ensure proper spacing around Thai characters
      formattedText = formattedText.replace(/([ก-๛])/g, ' $1 ').replace(/\s+/g, ' ').trim();
      break;
    
    case 'hi-IN':
    case 'ta-IN':
      // Hindi and Tamil: Ensure proper word spacing
      // Keep existing spaces between distinct words
      formattedText = formattedText.replace(/([।॥\u0900-\u097F])/g, '$1 ').replace(/\s+/g, ' ').trim();
      break;
    
    case 'ja-JP':
      // Japanese: Add spaces between words
      // Add spaces between kanji, hiragana, and katakana segments
      formattedText = formattedText
        .replace(/([一-龯]|[ぁ-ん]|[ァ-ン])/g, ' $1 ')
        .replace(/\s+/g, ' ')
        .trim();
      break;
    
    case 'zh-CN':
    case 'zh-TW':
    case 'zh-HK':
      // Chinese variants: Remove spaces between characters
      formattedText = formattedText.replace(/\s+/g, '');
      break;
    
    case 'ko-KR':
      // Korean: Maintain natural Korean spacing
      // Keep existing spaces as they are likely grammatically correct
      break;
    
    default:
      // For Latin-based and Cyrillic scripts:
      // Just ensure single spaces between words and no space before punctuation
      formattedText = formattedText
        .replace(/\s+([,.!?])/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
  }

  return formattedText;
};

// Test helper function
export const testFormatting = () => {
  console.log('Thai:', formatTargetText('สวัสดี ค่ะ!รับ อะไร ดี คะ?', 'th-TH'));
  console.log('Japanese:', formatTargetText('こんにちは!コーヒーをください', 'ja-JP'));
  console.log('Chinese:', formatTargetText('你 好！ 咖 啡', 'zh-CN'));
  console.log('Korean:', formatTargetText('안녕하세요! 커피 주세요', 'ko-KR'));
  console.log('Hindi:', formatTargetText('नमस्ते!क्या लेंगे आप?', 'hi-IN'));
  console.log('Tamil:', formatTargetText('வணக்கம்!நீங்கள் என்ன விரும்புகிறீர்கள்?', 'ta-IN'));
};
