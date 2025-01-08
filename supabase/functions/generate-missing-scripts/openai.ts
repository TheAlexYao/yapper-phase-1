import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { ScriptLine, ScriptData } from './types.ts';

export async function generateScript(prompt: string): Promise<ScriptData> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not found');
  }

  try {
    console.log('Generating script with prompt:', prompt);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates conversation scripts for language learning, focusing on restaurant scenarios.'
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
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    // Parse the response and structure it as ScriptData
    const content = data.choices[0].message.content;
    try {
      // Assuming the model returns JSON in our required format
      const parsedContent = JSON.parse(content);
      return {
        lines: parsedContent.lines,
        languageCode: parsedContent.languageCode
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Invalid script format returned from OpenAI');
    }
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}