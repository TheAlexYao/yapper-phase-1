import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { corsHeaders } from './constants.ts';
import { SYSTEM_PROMPT } from './constants.ts';
import { ScriptGenerationResult } from './types.ts';
import {
  fetchAllLanguages,
  fetchAllTopics,
  fetchAllScenarios,
  fetchAllCharacters,
  checkExistingScript,
  executeSQL
} from './database.ts';
import { generateScript } from './openai.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const languages = await fetchAllLanguages();
    const topics = await fetchAllTopics();
    const scenarios = await fetchAllScenarios();
    const characters = await fetchAllCharacters();

    console.log(`Found ${languages.length} languages, ${topics.length} topics, ${scenarios.length} scenarios, ${characters.length} characters`);

    let generatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const lang of languages) {
      for (const topic of topics) {
        const topicScenarios = scenarios.filter(s => s.topic === topic.title);
        const topicCharacters = characters.filter(c => c.topic === topic.title);

        for (const scenario of topicScenarios) {
          for (const character of topicCharacters) {
            try {
              const exists = await checkExistingScript(lang.code, scenario.id, character.id);

              if (!exists) {
                console.log(`Generating script for ${lang.code}, scenario ${scenario.title}, character ${character.name}`);

                const prompt = `${SYSTEM_PROMPT}\n\nGenerate a script for:
                Language: ${lang.code}
                Scenario: ${scenario.title}
                Character: ${character.name} (${character.gender})
                Topic: ${topic.title}`;

                const sqlStatement = await generateScript(prompt);

                await executeSQL(sqlStatement);
                generatedCount++;
                
                // Add a small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (error) {
              console.error(`Error generating script:`, error);
              errorCount++;
              errors.push(`${lang.code}-${scenario.id}-${character.id}: ${error.message}`);
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