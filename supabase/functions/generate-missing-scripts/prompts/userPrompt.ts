export const USER_PROMPT = `Generate a conversation script with the following parameters:
Language: {languageCode}
Scenario: {scenarioTitle}
Character: {characterName} ({characterGender})
Topic: {topicTitle}

The script should follow this structure:
{
  "languageCode": "{languageCode}",
  "lines": [
    {
      "lineNumber": 1,
      "speaker": "character",
      "targetText": "...",
      "transliteration": "...",
      "translation": "..."
    },
    // ... 6 lines total alternating between character and user
  ]
}

Please ensure:
1. Natural dialogue appropriate for the scenario
2. STRICT adherence to language-specific spacing rules
3. Appropriate formality level for the culture
4. Clear turn-taking between character and user
5. Context-appropriate vocabulary
6. Accurate transliteration using these examples as reference:

East Asian Languages:
Chinese (zh-CN, zh-TW):
- 你好 → nee-how
- 谢谢 → shyeh-shyeh
- 咖啡 → kah-fey

Japanese (ja-JP):
- こんにちは → kohn-nee-chee-wah
- ありがとう → ah-ree-gah-toh
- コーヒー → koh-hee

Korean (ko-KR):
- 안녕하세요 → ahn-nyong-ha-say-yo
- 감사합니다 → gam-sah-ham-nee-da
- 커피 → kuh-pee

South/Southeast Asian:
Hindi (hi-IN):
- नमस्ते → nuh-muh-stay
- धन्यवाद → dun-yuh-vahd
- कॉफ़ी → koh-fee

Tamil (ta-IN):
- வணக்கம் → vuh-nuh-kum
- நன்றி → nun-dree
- காபி → kah-pee

Thai (th-TH):
- สวัสดี → sah-wah-dee
- ขอบคุณ → kop-kun
- กาแฟ → gah-fae

Vietnamese (vi-VN):
- xin chào → sin chow
- cảm ơn → kam uhn
- cà phê → kah feh

European Languages:
Russian (ru-RU):
- здравствуйте → zdrah-stvooy-tye
- спасибо → spah-see-bah
- кофе → koh-fye

German (de-DE):
- danke → dahn-kuh
- kaffee → kah-feh
- zwanzig → tsvahn-tsig`;

export function formatUserPrompt(params: {
  languageCode: string;
  scenarioTitle: string;
  characterName: string;
  characterGender: string;
  topicTitle: string;
}): string {
  return USER_PROMPT
    .replace(/{languageCode}/g, params.languageCode)
    .replace(/{scenarioTitle}/g, params.scenarioTitle)
    .replace(/{characterName}/g, params.characterName)
    .replace(/{characterGender}/g, params.characterGender)
    .replace(/{topicTitle}/g, params.topicTitle);
}