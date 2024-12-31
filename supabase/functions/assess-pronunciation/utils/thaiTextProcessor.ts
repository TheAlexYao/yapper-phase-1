// Simple utility to check if text needs spacing
export function ensureProperSpacing(text: string, languageCode: string): string {
  // If it's not an Asian language that typically doesn't use spaces, return as is
  if (!['th-TH', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR'].includes(languageCode)) {
    return text;
  }

  // If text already contains spaces, assume it's properly formatted
  if (text.includes(' ')) {
    return text;
  }

  // For Thai language specifically
  if (languageCode === 'th-TH') {
    // Add space after each word boundary marker (.|!|?), 
    // after numbers, and between Thai consonants and vowels
    return text
      .replace(/([.!?])/g, '$1 ')
      .replace(/([0-9])/g, '$1 ')
      .replace(/([\u0E01-\u0E5B])/g, '$1 ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // For Chinese, Japanese, and Korean
  // Add space between each character, as they are typically single units
  return text.split('').join(' ').trim();
}