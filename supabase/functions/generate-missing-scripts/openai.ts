import { SYSTEM_PROMPT } from './constants.ts';

export async function generateScript(userPrompt: string) {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API key');
  }

  console.log('Generating script with prompt:', userPrompt);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `${userPrompt}\n\nIMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.` 
        }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  console.log('OpenAI response:', data);

  try {
    const content = data.choices[0].message.content;
    // Remove any markdown code block formatting if present
    const cleanJson = content.replace(/```json\n|\n```/g, '');
    console.log('Cleaned JSON string:', cleanJson);
    
    const scriptData = JSON.parse(cleanJson);
    console.log('Parsed script data:', scriptData);
    
    // Validate the required structure
    if (!scriptData.languageCode || !Array.isArray(scriptData.lines)) {
      throw new Error('Invalid script data structure: missing required fields');
    }
    
    return scriptData;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    console.error('Raw content:', data.choices[0].message.content);
    throw new Error('Failed to parse script data from OpenAI response');
  }
}