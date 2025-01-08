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
2. Proper grammar and punctuation for {languageCode}
3. Appropriate formality level for the culture
4. Clear turn-taking between character and user
5. Context-appropriate vocabulary`;

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