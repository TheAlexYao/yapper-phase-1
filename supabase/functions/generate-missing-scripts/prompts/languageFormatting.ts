export const LANGUAGE_FORMATTING = `
### 1. Language & Text Formatting Requirements

Each language has specific spacing requirements for proper TTS and pronunciation assessment. You MUST follow these rules EXACTLY when generating text:

1. Thai (th-TH): Add spaces between each word unit
   Example: "สวัสดี ค่ะ! รับ อะไร ดี คะ?"

2. Hindi (hi-IN): Add spaces between distinct words
   Example: "नमस्ते! क्या लेंगे आप?"

3. Tamil (ta-IN): Add spaces between words
   Example: "வணக்கம்! நீங்கள் என்ன விரும்புகிறீர்கள்?"

4. Japanese (ja-JP): Add spaces between words
   Example: "こんにちは! コーヒー を ください"

5. Chinese (zh-CN, zh-TW, zh-HK): No spaces between characters
   Example: "你好！咖啡"

6. Korean (ko-KR): Use natural Korean word spacing
   Example: "안녕하세요! 커피 주세요"

7. Latin-based and Cyrillic scripts: Use standard spacing
   - No space before punctuation marks
   - Single space between words

Important:
- Always use native numerals appropriate for each language
- Maintain proper spacing as shown in examples
- No space before punctuation marks like ! or ? in any language
- You MUST follow these spacing rules for ALL text you generate
- The spacing must be EXACTLY as shown in the examples`;