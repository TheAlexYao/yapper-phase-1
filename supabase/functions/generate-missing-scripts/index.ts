import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { corsHeaders } from './constants.ts';
import { SYSTEM_PROMPT } from './constants.ts';
import { formatUserPrompt } from './prompts/userPrompt.ts';
import { ScriptGenerationResult } from './types.ts';
import { generateScript } from './openai.ts';
import { supabase } from './database.ts';

const SUPPORTED_LANGUAGES = [
  'zh-CN', 'zh-TW', 'zh-HK', 'ja-JP', 'ko-KR',  // East Asian
  'hi-IN', 'ta-IN', 'th-TH', 'vi-VN', 'ms-MY',  // South/Southeast Asian
  'ru-RU', 'de-DE', 'pt-BR', 'pt-PT', 'es-ES',  // European (part 1)
  'es-MX', 'fr-FR', 'fr-CA', 'it-IT', 'nl-NL',  // European (part 2)
  'sv-SE', 'nb-NO', 'pl-PL', 'en-US'            // European (part 3)
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting script generation process for all languages...');

    // Get food topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('title', 'Food')
      .single();

    if (topicError || !topic) {
      console.error('Error fetching topic:', topicError);
      throw new Error('Food topic not found');
    }

    console.log('Found topic:', topic);

    // Get restaurant scenario
    const { data: scenario, error: scenarioError } = await supabase
      .from('default_scenarios')
      .select('*')
      .eq('topic', 'Food')
      .eq('title', 'Ordering at a Restaurant')
      .single();

    if (scenarioError || !scenario) {
      console.error('Error fetching scenario:', scenarioError);
      throw new Error('Restaurant scenario not found');
    }

    console.log('Found scenario:', scenario);

    // Get food-related characters
    const { data: characters, error: charactersError } = await supabase
      .from('characters')
      .select('*')
      .eq('topic', 'Food');

    if (charactersError || !characters || characters.length === 0) {
      console.error('Error fetching characters:', charactersError);
      throw new Error('No food-related characters found');
    }

    console.log('Found characters:', characters);

    let generatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each language
    for (const languageCode of SUPPORTED_LANGUAGES) {
      console.log(`Processing language: ${languageCode}`);
      
      for (const character of characters) {
        try {
          // Check if script already exists
          const { data: existingScript } = await supabase
            .from('scripts')
            .select('id')
            .eq('language_code', languageCode)
            .eq('scenario_id', scenario.id)
            .eq('character_id', character.id)
            .maybeSingle();

          if (!existingScript) {
            console.log(`Generating script for ${languageCode}, scenario ${scenario.title}, character ${character.name}`);

            const userPrompt = formatUserPrompt({
              languageCode,
              scenarioTitle: scenario.title,
              characterName: character.name,
              characterGender: character.gender || 'unknown',
              topicTitle: topic.title
            });

            const scriptData = await generateScript(userPrompt);
            
            // Insert the script using Supabase client
            const { error: insertError } = await supabase
              .from('scripts')
              .insert({
                language_code: languageCode,
                scenario_id: scenario.id,
                topic_id: topic.id,
                character_id: character.id,
                user_gender: character.gender === 'male' ? 'male' : 'female',
                script_data: scriptData,
                audio_generated: false
              });

            if (insertError) {
              throw insertError;
            }

            generatedCount++;
            console.log(`Successfully generated and inserted script for ${character.name} in ${languageCode}`);
            
            // Add a small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log(`Script already exists for ${character.name} in ${languageCode}`);
          }
        } catch (error) {
          console.error(`Error generating script for ${character.name} in ${languageCode}:`, error);
          errorCount++;
          errors.push(`${languageCode}-${scenario.id}-${character.id}: ${error.message}`);
        }
      }
    }

    const result: ScriptGenerationResult = {
      success: true,
      generated: generatedCount,
      errors: errorCount,
      errorDetails: errors
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});