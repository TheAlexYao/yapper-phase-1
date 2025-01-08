export const SQL_FORMAT = `### 4. SQL Format
The output should be a valid SQL INSERT statement for the scripts table:

\`\`\`sql
INSERT INTO scripts (language_code, scenario_id, character_id, user_gender, script_data)
VALUES (
  '[language_code]',
  '[scenario_id]',
  '[character_id]',
  'male',
  '[script_data_json]'
);
\`\`\`

### 5. Language Rules
1. **Transliteration**:
   - Required for non-Latin scripts
   - Use English phonetic approximations
   - Break into syllables with hyphens
   - Optional for European languages`;