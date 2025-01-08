import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface ScriptLine {
  speaker: 'character' | 'user';
  targetText: string;
  transliteration: string;
  translation: string;
  audioUrl?: string;
}

interface ScriptData {
  lines: ScriptLine[];
  languageCode: string;
}

export async function generateScript(prompt: string): Promise<ScriptData> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not found');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates conversation scripts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    // Parse the response and structure it according to our needs
    const scriptData: ScriptData = {
      lines: [
        {
          speaker: 'character',
          targetText: '¡Hola! ¿Qué te gustaría ordenar?',
          transliteration: 'Ola! Ke te gustaría ordenar?',
          translation: 'Hello! What would you like to order?'
        },
        {
          speaker: 'user',
          targetText: 'Me gustaría una sopa de tortilla, por favor.',
          transliteration: 'Me gustaría una sopa de tortiya, por favor.',
          translation: 'I would like a tortilla soup, please.'
        }
        // Add more lines as needed based on the OpenAI response
      ],
      languageCode: 'es-MX'
    };

    return scriptData;
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}