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
          content: `${userPrompt}\n\nIMPORTANT: You MUST follow the language-specific spacing rules EXACTLY as defined in the formatting requirements. The text spacing must match the examples provided for each language type.` 
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
    const scriptData = JSON.parse(data.choices[0].message.content);
    console.log('Parsed script data:', scriptData);
    return scriptData;
  } catch (error) {
    console.error('Error parsing OpenAI response:', error);
    throw new Error('Failed to parse script data from OpenAI response');
  }
}