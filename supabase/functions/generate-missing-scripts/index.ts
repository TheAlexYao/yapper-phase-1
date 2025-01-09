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
    const { generateAll, languageCode } = await req.json();
    const languagesToProcess = generateAll ? SUPPORTED_LANGUAGES : [languageCode];

    if (!generateAll && !SUPPORTED_LANGUAGES.includes(languageCode)) {
      throw new Error(`Unsupported language code: ${languageCode}`);
    }

    console.log(`Starting script generation process for ${generateAll ? 'all languages' : languageCode}...`);

    // Get all active topics
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true);

    if (topicsError || !topics) {
      console.error('Error fetching topics:', topicsError);
      throw new Error('No active topics found');
    }

    console.log(`Found ${topics.length} active topics`);

    let generatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each topic
    for (const topic of topics) {
      console.log(`Processing topic: ${topic.title}`);

      // Get all scenarios for this topic
      const { data: scenarios, error: scenariosError } = await supabase
        .from('default_scenarios')
        .select('*')
        .eq('topic', topic.title);

      if (scenariosError) {
        console.error(`Error fetching scenarios for topic ${topic.title}:`, scenariosError);
        continue;
      }

      if (!scenarios || scenarios.length === 0) {
        console.log(`No scenarios found for topic: ${topic.title}`);
        continue;
      }

      console.log(`Found ${scenarios.length} scenarios for topic: ${topic.title}`);

      // Get characters for this topic
      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .eq('topic', topic.title);

      if (charactersError || !characters || characters.length === 0) {
        console.error(`Error fetching characters for topic ${topic.title}:`, charactersError);
        continue;
      }

      console.log(`Found ${characters.length} characters for topic: ${topic.title}`);

      // Process each scenario
      for (const scenario of scenarios) {
        console.log(`Processing scenario: ${scenario.title}`);
        
        // Process each character
        for (const character of characters) {
          console.log(`Processing character: ${character.name}`);
          
          // Process specified languages
          for (const currentLanguageCode of languagesToProcess) {
            try {
              // Check if script already exists
              const { data: existingScript } = await supabase
                .from('scripts')
                .select('id')
                .eq('language_code', currentLanguageCode)
                .eq('scenario_id', scenario.id)
                .eq('character_id', character.id)
                .maybeSingle();

              if (!existingScript) {
                console.log(`Generating script for ${currentLanguageCode}, scenario ${scenario.title}, character ${character.name}`);

                const userPrompt = formatUserPrompt({
                  languageCode: currentLanguageCode,
                  scenarioTitle: scenario.title,
                  characterName: character.name,
                  characterGender: character.gender || 'unknown',
                  topicTitle: topic.title
                });

                const scriptData = await generateScript(userPrompt);
                
                const { error: insertError } = await supabase
                  .from('scripts')
                  .insert({
                    language_code: currentLanguageCode,
                    scenario_id: scenario.id,
                    topic_id: topic.id,
                    character_id: character.id,
                    user_gender: 'male',
                    script_data: scriptData,
                    audio_generated: false
                  });

                if (insertError) {
                  throw insertError;
                }

                generatedCount++;
                console.log(`Successfully generated and inserted script for ${character.name} in ${currentLanguageCode}`);
                
                // Add a small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
              } else {
                console.log(`Script already exists for ${character.name} in ${currentLanguageCode}`);
              }
            } catch (error) {
              console.error(`Error generating script for ${character.name} in ${currentLanguageCode}:`, error);
              errorCount++;
              errors.push(`${currentLanguageCode}-${scenario.id}-${character.id}: ${error.message}`);
            }
          }
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