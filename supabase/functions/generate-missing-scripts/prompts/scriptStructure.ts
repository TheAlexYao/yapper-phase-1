export const SCRIPT_STRUCTURE = `### 3. Script Structure
1. **Format**:
   \`\`\`json
   {
     "languageCode": "string",
     "lines": [
       {
         "lineNumber": number,
         "speaker": "character" | "user",
         "targetText": "string",
         "transliteration": "string",
         "translation": "string"
       }
     ]
   }
   \`\`\`

2. **Requirements**:
   - Exactly 6 lines per script
   - Alternate between character and user
   - Character always speaks first (odd-numbered lines)
   - User responds (even-numbered lines)`;