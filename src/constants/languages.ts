export const SUPPORTED_LANGUAGES = {
  'en-US': { name: 'English', flag: '🇺🇸' },
  'es-ES': { name: 'Spanish', flag: '🇪🇸' },
  'th-TH': { name: 'Thai', flag: '🇹🇭' },
  'ru-RU': { name: 'Russian', flag: '🇷🇺' },
  'vi-VN': { name: 'Vietnamese', flag: '🇻🇳' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;