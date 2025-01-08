export const LANGUAGE_FORMATTING = `
### 1. Language & Localization
1. **Language Code**: \`<LANGUAGE_CODE>\` (e.g., \`"vi-VN"\`, \`"th-TH"\`, \`"es-ES"\`, etc.).
2. **Cultural Authenticity**: Localize content to the chosen language/culture (if relevant). Use **casual language** and **realistic references** (e.g., local dishes, local greetings).
3. **Spacing & Text Format Requirements**:
   - **Thai (th-TH)**: Add spaces between each word unit: \`"สวัสดี ค่ะ! รับ อะไร ดี คะ?"\`
   - **Hindi (hi-IN)**: Add spaces between distinct words: \`"नमस्ते! क्या लेंगे आप?"\` 
   - **Tamil (ta-IN)**: Add spaces between words: \`"வணக்கம்! நீங்கள் என்ன விரும்புகிறீர்கள்?"\`
   - **Japanese (ja-JP)**: Add spaces between words: \`"こんにちは! コーヒー を ください"\`
   - **Chinese (zh-CN, zh-TW, zh-HK)**: No spaces needed between characters
   - **Korean (ko-KR)**: Natural word spacing as per standard Korean
   - Latin-based, Cyrillic scripts: Standard spacing
   - **No space** before punctuation like \`!\` or \`?\` in any language
   - Use native numerals appropriate for each language

4. **Sound-Based Transliteration for English Speakers**:
   - Break words into syllables with hyphens
   - Use English letter combinations that best match the actual sound
   - Keep it simple and consistent
   - Focus on how words actually sound, not technical accuracy
   - Use familiar English words or sounds as reference when helpful

**East Asian Languages**:
- **Mandarin Chinese (zh-CN, zh-TW)**:
  \`\`\`
  你好 -> "nee-how"
  谢谢 -> "shyeh-shyeh"
  咖啡 -> "kah-fey"
  热的 -> "reh duh"
  二十 -> "ar-shur"
  \`\`\`

- **Cantonese (zh-HK)**:
  \`\`\`
  你好 -> "nay-how"
  唔該 -> "mm-goy"
  咖啡 -> "gah-fey"
  二十 -> "yee-sup"
  \`\`\`

- **Japanese (ja-JP)**:
  \`\`\`
  こんにちは -> "kohn-nee-chee-wah"
  ありがとう -> "ah-ree-gah-toh"
  コーヒー -> "koh-hee"
  二千円 -> "nee-sen yen"
  \`\`\`

- **Korean (ko-KR)**:
  \`\`\`
  안녕하세요 -> "ahn-nyong-ha-say-yo"
  감사합니다 -> "gam-sah-ham-nee-da"
  커피 -> "kuh-pee"
  \`\`\`

**South/Southeast Asian Languages**:
- **Hindi (hi-IN)**:
  \`\`\`
  नमस्ते -> "nuh-muh-stay" (like "stay")
  धन्यवाद -> "dun-yuh-vahd"
  कॉफ़ी -> "koh-fee"
  \`\`\`

- **Tamil (ta-IN)**:
  \`\`\`
  வணக்கம் -> "vuh-nuh-kum"
  நன்றி -> "nun-dree"
  காபி -> "kah-pee"
  \`\`\`

- **Thai (th-TH)**:
  \`\`\`
  สวัสดี -> "sah-wah-dee"
  ขอบคุณ -> "kop-kun"
  กาแฟ -> "gah-fae"
  \`\`\`

- **Vietnamese (vi-VN)**:
  \`\`\`
  xin chào -> "sin chow"
  cảm ơn -> "kam uhn"
  cà phê -> "kah feh"
  \`\`\`

- **Malay (ms-MY)**:
  \`\`\`
  terima kasih -> "tuh-ree-mah kah-see"
  kopi -> "koh-pee"
  dua puluh -> "doo-ah poo-loo"
  \`\`\`

**European Languages**:
- **Russian (ru-RU)**:
  \`\`\`
  здравствуйте -> "zdrah-stvooy-tye" (like "stroy")
  спасибо -> "spah-see-bah"
  кофе -> "koh-fye"
  \`\`\`

- **German (de-DE)**:
  \`\`\`
  danke -> "dahn-kuh"
  kaffee -> "kah-feh"
  zwanzig -> "tsvahn-tsig"
  \`\`\`

- **Portuguese (pt-BR, pt-PT)**:
  \`\`\`
  obrigado -> "oh-bree-gah-doo"
  café -> "kah-feh"
  vinte -> "veen-chee"
  \`\`\`

- **Spanish (es-ES, es-MX)**:
  \`\`\`
  gracias -> "grah-syahs"
  café -> "kah-feh"
  veinte -> "vey-n-teh"
  \`\`\`

- **French (fr-FR, fr-CA)**:
  \`\`\`
  merci -> "mair-see"
  café -> "kah-feh"
  vingt -> "van"
  \`\`\`

- **Italian (it-IT)**:
  \`\`\`
  grazie -> "grah-tsee-eh"
  caffè -> "kah-feh"
  venti -> "ven-tee"
  \`\`\`

**Other Germanic Languages**:
- **Dutch (nl-NL)**:
  \`\`\`
  dank je -> "dahnk yuh"
  koffie -> "koh-fee"
  twintig -> "tvin-tug"
  \`\`\`

- **Swedish (sv-SE)**:
  \`\`\`
  tack -> "tahk"
  kaffe -> "kah-feh"
  tjugo -> "shoo-goo"
  \`\`\`

- **Norwegian (nb-NO)**:
  \`\`\`
  takk -> "tahk"
  kaffe -> "kah-feh"
  tjue -> "shoo-eh"
  \`\`\`

**Slavic Languages**:
- **Polish (pl-PL)**:
  \`\`\`
  dziękuję -> "jen-koo-yeh"
  kawa -> "kah-vah"
  dwadzieścia -> "dvah-yesh-cha"
  \`\`\`
`;
