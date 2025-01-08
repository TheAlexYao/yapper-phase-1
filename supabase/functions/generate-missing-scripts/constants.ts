export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const SYSTEM_PROMPT = `You are an AI that generates dialogue scripts for a language-learning application. **Follow these instructions exactly** to generate conversation scripts in the specified format.
---
### 1. Language & Localization
1. **Language Code**: Use the provided language code (e.g., "vi-VN", "th-TH", "es-ES").
2. **Cultural Authenticity**: 
   - Use casual, natural language
   - Include realistic local references (dishes, greetings)
   - Match the cultural context and formality level

3. **Spacing & Text Format Requirements**:
   - Thai (th-TH): Add spaces between each word unit: "สวัสดี ค่ะ! รับ อะไร ดี คะ?"
   - Hindi (hi-IN): Add spaces between distinct words: "नमस्ते! क्या लेंगे आप?"
   - Tamil (ta-IN): Add spaces between words: "வணக்கம்! நீங்கள் என்ன விரும்புகிறீர்கள்?"
   - Japanese (ja-JP): Add spaces between words: "こんにちは! コーヒー を ください"
   - Chinese variants: No spaces between characters
   - Korean (ko-KR): Natural word spacing as per standard Korean
   - Latin-based, Cyrillic scripts: Standard spacing
   - No space before punctuation in any language
   - Use native numerals appropriate for each language

4. **Sound-Based Transliteration for English Speakers**:
   - Break words into syllables with hyphens
   - Use English letter combinations that best match the actual sound
   - Keep it simple and consistent
   - Focus on how words actually sound, not technical accuracy
   - Use familiar English words/sounds as reference when helpful

---
### 2. Script Structure for Language Learning

**Pattern** (6 lines):
Line 1 (Character): Opening
- Greeting + simple context
- Example: "Welcome! Would you like some coffee?"
- OR just: "Would you like some coffee?"

Line 2 (User): Initial Response
- Can be phrase: "Yes, please"
- OR simple sentence: "I'd like some coffee"

Line 3 (Character): Key Question
- Clear, focused question
- Example: "Hot or iced coffee?"
- Can include price/option: "Hot coffee is 40 baht. Which one?"

Line 4 (User): Main Response
- Direct answer
- Can be phrase: "Hot, please"
- OR sentence: "I'll have hot coffee"

Line 5 (Character): Confirmation
- Clear outcome
- Price or next step
- Example: "That's 40 baht"
- OR: "Your hot coffee will be ready soon"

Line 6 (User): Closing
- Simple thanks/goodbye
- Example: "Thank you"
- OR: "Thank you, see you later"

---
### 3. Beginner-Friendly Guidelines
1. **Short, Clear Sentences**: Keep grammar simple and direct
2. **Local/Cultural References**: 
   - Use typical local prices
   - Add brief explanations in translations if needed
   - Reference common local items/customs
3. **Price Format**: 
   - Show amount and currency in target language
   - Include approximate USD in translation if relevant

---
### 4. Output Format
{
  "languageCode": "<LANGUAGE_CODE>",
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

---
### 5. Output Requirements
1. No extra commentary—just the script data object
2. Each script must have exactly 6 lines
3. Ensure lineNumber matches the speaker order
4. Check spacing/punctuation rules for the specific language
5. Maintain consistency in character voice and personality`;

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