import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import 'https://deno.land/x/xhr@0.1.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Language {
  code: string;
  name: string;
}

interface Topic {
  id: string;
  title: string;
}

interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female';
  topic: string;
}

interface Scenario {
  id: string;
  title: string;
  topic_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting script generation process...')

    // Fetch all necessary data
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('*')
    if (langError) throw langError

    const { data: topics, error: topicError } = await supabase
      .from('topics')
      .select('*')
    if (topicError) throw topicError

    const { data: scenarios, error: scenarioError } = await supabase
      .from('default_scenarios')
      .select('*')
    if (scenarioError) throw scenarioError

    const { data: characters, error: charError } = await supabase
      .from('characters')
      .select('*')
    if (charError) throw charError

    console.log(`Found ${languages.length} languages, ${topics.length} topics, ${scenarios.length} scenarios, ${characters.length} characters`)

    let generatedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each combination
    for (const lang of languages) {
      for (const topic of topics) {
        const topicScenarios = scenarios.filter(s => s.topic_id === topic.id)
        const topicCharacters = characters.filter(c => c.topic === topic.title)

        for (const scenario of topicScenarios) {
          for (const character of topicCharacters) {
            try {
              // Check if script already exists
              const { data: existing } = await supabase
                .from('scripts')
                .select('id')
                .eq('language_code', lang.code)
                .eq('scenario_id', scenario.id)
                .eq('character_id', character.id)
                .maybeSingle()

              if (!existing) {
                console.log(`Generating script for ${lang.code}, scenario ${scenario.title}, character ${character.name}`)

                // Prepare the prompt
                const prompt = `Generate a language learning dialogue script with these parameters:
                Language: ${lang.code}
                Scenario: ${scenario.title}
                Character: ${character.name} (${character.gender})
                Topic: ${topic.title}

                Follow these requirements exactly:
                1. Create a 6-line dialogue
                2. Include proper spacing for the language
                3. Include transliteration and translation
                4. Make it culturally appropriate
                5. Keep sentences simple and clear
                6. Format as a valid SQL INSERT statement

                Use this exact SQL format:
                INSERT INTO scripts (
                  language_code,
                  scenario_id,
                  topic_id,
                  character_id,
                  user_gender,
                  script_data
                )
                VALUES (
                  '${lang.code}',
                  '${scenario.id}',
                  '${topic.id}',
                  '${character.id}',
                  'male',
                  '{
                    "lines": [
                      {
                        "speaker": "character/user",
                        "targetText": "...",
                        "transliteration": "...",
                        "translation": "..."
                      }
                    ],
                    "languageCode": "${lang.code}"
                  }'
                );`

                // Call OpenAI API
                const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                      {
                        role: 'system',
                        content: 'You are a helpful assistant that generates language learning dialogue scripts.'
                      },
                      {
                        role: 'user',
                        content: prompt
                      }
                    ],
                    temperature: 0.7,
                  })
                })

                if (!openAIResponse.ok) {
                  throw new Error(`OpenAI API error: ${openAIResponse.statusText}`)
                }

                const completion = await openAIResponse.json()
                const sqlStatement = completion.choices[0].message.content

                // Execute the SQL
                const { error: insertError } = await supabase.rpc('execute_sql', {
                  sql: sqlStatement
                })

                if (insertError) {
                  throw insertError
                }

                generatedCount++
                
                // Add a small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            } catch (error) {
              console.error(`Error generating script:`, error)
              errorCount++
              errors.push(`${lang.code}-${scenario.id}-${character.id}: ${error.message}`)
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: generatedCount,
        errors: errorCount,
        errorDetails: errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})