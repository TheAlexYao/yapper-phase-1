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
        "targetText": "...",
        "transliteration": "...",
        "translation": "..."
      },
      {
        "lineNumber": 2,
        "speaker": "user",
        "targetText": "...",
        "transliteration": "...",
        "translation": "..."
      },
      ...
      {
        "lineNumber": 6,
        "speaker": "user",
        "targetText": "...",
        "transliteration": "...",
        "translation": "..."
      }
    ]
  }'
);
\`\`\`
`;