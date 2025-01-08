export const SQL_FORMAT = `
### 5. SQL Insert Format
\`\`\`sql
INSERT INTO scripts (
  language_code,
  scenario_id,
  topic_id,
  character_id,
  user_gender,
  script_data
)
VALUES (
  '<LANGUAGE_CODE>',
  '<SCENARIO_UUID>',  -- UUID from default_scenarios table
  '<TOPIC_UUID>',    -- UUID from topics table
  '<CHARACTER_UUID>', -- UUID from characters table
  'male',
  '{
    "languageCode": "<LANGUAGE_CODE>",
    "scenario": { 
      "id": "<SCENARIO_UUID>", 
      "title": "<SCENARIO_TITLE>" 
    },
    "topic": { 
      "id": "<TOPIC_UUID>", 
      "title": "<TOPIC_TITLE>" 
    },
    "character": { 
      "id": "<CHARACTER_UUID>", 
      "name": "<CHARACTER_NAME>", 
      "gender": "<male/female>" 
    },
    "userGender": "male",
    "lines": [
      {
        "lineNumber": 1,
        "speaker": "character",
        "targetText": "Welcome! Would you like some coffee?",
        "transliteration": "Wel-kahm! Wud yuh laik sum kaw-fee?",
        "translation": "¡Bienvenido! ¿Te gustaría un café?"
      },
      {
        "lineNumber": 2,
        "speaker": "user",
        "targetText": "Yes, please",
        "transliteration": "Yes, pleez",
        "translation": "Sí, por favor"
      },
      {
        "lineNumber": 3,
        "speaker": "character",
        "targetText": "Hot or iced coffee?",
        "transliteration": "Hot or iced kaw-fee?",
        "translation": "¿Café caliente o helado?"
      },
      {
        "lineNumber": 4,
        "speaker": "user",
        "targetText": "Hot, please",
        "transliteration": "Hot, pleez",
        "translation": "Caliente, por favor"
      },
      {
        "lineNumber": 5,
        "speaker": "character",
        "targetText": "That's 40 baht",
        "transliteration": "That's 40 baht",
        "translation": "Eso es 40 baht"
      },
      {
        "lineNumber": 6,
        "speaker": "user",
        "targetText": "Thank you",
        "transliteration": "Thank yuh",
        "translation": "Gracias"
      }
    ]
  }'
);
\`\`\`
`;
