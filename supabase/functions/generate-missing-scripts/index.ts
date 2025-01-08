import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { corsHeaders } from './constants.ts';
import { SYSTEM_PROMPT } from './constants.ts';
import { ScriptGenerationResult } from './types.ts';
import { generateScript } from './openai.ts';
import { supabase } from './database.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting script generation process...');

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

    for (const character of characters) {
      try {
        // Check if script already exists
        const { data: existingScript } = await supabase
          .from('scripts')
          .select('id')
          .eq('language_code', 'es-MX')
          .eq('scenario_id', scenario.id)
          .eq('character_id', character.id)
          .maybeSingle();

        if (!existingScript) {
          console.log(`Generating script for es-MX, scenario ${scenario.title}, character ${character.name}`);

          // Format the prompt according to our system prompt structure
          const userPrompt = `Generate an SQL INSERT statement for a restaurant conversation script with the following parameters:
            Language: Mexican Spanish (es-MX)
            Scenario: ${scenario.title}
            Character: ${character.name} (${character.gender})
            Topic: ${topic.title}
            
            The script should follow the exact structure defined in the system prompt, with 6 lines of dialogue between the character (${character.name}) and the user.
            
            Please ensure:
            1. Natural restaurant dialogue
            2. Proper Spanish grammar and punctuation
            3. Appropriate formality level
            4. Clear turn-taking between character and user
            5. Context-appropriate vocabulary`;

          const scriptData = await generateScript(userPrompt);
          
          // Insert the script using Supabase client
          const { error: insertError } = await supabase
            .from('scripts')
            .insert({
              language_code: 'es-MX',
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
          console.log(`Successfully generated and inserted script for ${character.name}`);
          
          // Add a small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`Script already exists for ${character.name}`);
        }
      } catch (error) {
        console.error(`Error generating script for ${character.name}:`, error);
        errorCount++;
        errors.push(`es-MX-${scenario.id}-${character.id}: ${error.message}`);
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