import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Language, Topic, Character, Scenario } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Using service role key to bypass RLS

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false // Disable session persistence for edge functions
  }
});

export async function fetchAllLanguages(): Promise<Language[]> {
  const { data, error } = await supabase.from('languages').select('*');
  if (error) throw error;
  return data;
}

export async function fetchAllTopics(): Promise<Topic[]> {
  const { data, error } = await supabase.from('topics').select('*');
  if (error) throw error;
  return data;
}

export async function fetchAllScenarios(): Promise<Scenario[]> {
  const { data, error } = await supabase.from('default_scenarios').select('*');
  if (error) throw error;
  return data;
}

export async function fetchAllCharacters(): Promise<Character[]> {
  const { data, error } = await supabase.from('characters').select('*');
  if (error) throw error;
  return data;
}

export async function checkExistingScript(
  languageCode: string,
  scenarioId: string,
  characterId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('scripts')
    .select('id')
    .eq('language_code', languageCode)
    .eq('scenario_id', scenarioId)
    .eq('character_id', characterId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function executeSQL(sql: string): Promise<void> {
  const { error } = await supabase.rpc('execute_sql', { sql });
  if (error) throw error;
}