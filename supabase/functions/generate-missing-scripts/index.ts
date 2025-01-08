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
    // Get food topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('*')
      .eq('title', 'Food')
      .single();

    if (topicError || !topic) {
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
      throw new Error('Restaurant scenario not found');
    }

    console.log('Found scenario:', scenario);

    // Get food-related characters
    const { data: characters, error: charactersError } = await supabase
      .from('characters')
      .select('*')
      .eq('topic', 'Food');

    if (charactersError || !characters || characters.length === 0) {
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

          const prompt = `${SYSTEM_PROMPT}\n\nGenerate a script for:
            Language: es-MX (Mexican Spanish)
            Scenario: ${scenario.title}
            Character: ${character.name} (${character.gender})
            Topic: ${topic.title}`;

          const sqlStatement = await generateScript(prompt);
          console.log('Generated SQL:', sqlStatement);

          // Execute the SQL statement
          const { error: sqlError } = await supabase.rpc('execute_sql', { sql: sqlStatement });
          
          if (sqlError) {
            throw sqlError;
          }

          generatedCount++;
          
          // Add a small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(`Script already exists for ${character.name}`);
        }
      } catch (error) {
        console.error(`Error generating script:`, error);
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