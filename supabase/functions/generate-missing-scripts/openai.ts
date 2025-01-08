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

    // For testing, we'll create a structured restaurant conversation
    const scriptData: ScriptData = {
      lines: [
        {
          speaker: 'character',
          targetText: '¡Hola! Bienvenido a nuestro restaurante. ¿Qué le gustaría ordenar?',
          transliteration: 'Ola! Bienvenido a nuestro restaurante. Ke le gustaría ordenar?',
          translation: 'Hello! Welcome to our restaurant. What would you like to order?'
        },
        {
          speaker: 'user',
          targetText: 'Me gustaría ver el menú, por favor.',
          transliteration: 'Me gustaría ver el menú, por favor.',
          translation: 'I would like to see the menu, please.'
        },
        {
          speaker: 'character',
          targetText: 'Aquí tiene el menú. Nuestra especialidad es la paella.',
          transliteration: 'Akí tiene el menú. Nuestra especialidad es la paeya.',
          translation: 'Here is the menu. Our specialty is paella.'
        },
        {
          speaker: 'user',
          targetText: 'La paella suena bien. ¿Me la puede recomendar?',
          transliteration: 'La paeya suena bien. Me la puede recomendar?',
          translation: 'The paella sounds good. Can you recommend it?'
        },
        {
          speaker: 'character',
          targetText: 'Por supuesto, es un plato excelente. ¿Le gustaría ordenarla?',
          transliteration: 'Por supuesto, es un plato excelente. Le gustaría ordenarla?',
          translation: 'Of course, it\'s an excellent dish. Would you like to order it?'
        },
        {
          speaker: 'user',
          targetText: 'Sí, me gustaría ordenar la paella, gracias.',
          transliteration: 'Sí, me gustaría ordenar la paeya, grasias.',
          translation: 'Yes, I would like to order the paella, thank you.'
        }
      ],
      languageCode: 'es-MX'
    };

    return scriptData;
  } catch (error) {
    console.error('Error generating script:', error);
    throw error;
  }
}