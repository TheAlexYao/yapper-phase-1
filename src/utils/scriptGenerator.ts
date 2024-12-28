import { supabase } from "@/integrations/supabase/client";

export interface ScriptTemplate {
  id: string;
  scenario_id: string | null;
  character_id: string | null;
  user_gender: string | null;
  city_id: string | null;
}

export interface ScriptMessage {
  id: string;
  script_template_id: string | null;
  line_number: number;
  speaker: string | null;
  content: string;
  transliteration: string | null;
  translation: string | null;
}

export const generateScript = async (
  scenarioId: string,
  characterId: string,
  userGender: 'male' | 'female',
  cityId: string
): Promise<ScriptMessage[]> => {
  // First create a script template
  const { data: template, error: templateError } = await supabase
    .from('script_templates')
    .insert({
      scenario_id: scenarioId,
      character_id: characterId,
      user_gender: userGender,
      city_id: cityId
    })
    .select()
    .single();

  if (templateError) {
    console.error('Error creating script template:', templateError);
    throw templateError;
  }

  // Then create the script messages
  const defaultMessages = [
    {
      line_number: 1,
      speaker: 'character',
      content: 'Hello! How can I help you today?',
      translation: 'Hello! How can I help you today?',
    },
    {
      line_number: 2,
      speaker: 'user',
      content: '[Your response]',
      translation: '[Your response]',
    },
    {
      line_number: 3,
      speaker: 'character',
      content: 'I understand. Let me help you with that.',
      translation: 'I understand. Let me help you with that.',
    },
    {
      line_number: 4,
      speaker: 'user',
      content: '[Your response]',
      translation: '[Your response]',
    },
    {
      line_number: 5,
      speaker: 'character',
      content: 'Here you go! Is there anything else?',
      translation: 'Here you go! Is there anything else?',
    }
  ];

  const { data: messages, error: messagesError } = await supabase
    .from('script_messages')
    .insert(
      defaultMessages.map(msg => ({
        ...msg,
        script_template_id: template.id
      }))
    )
    .select();

  if (messagesError) {
    console.error('Error creating script messages:', messagesError);
    throw messagesError;
  }

  return messages;
};

export const getScriptMessages = async (scriptTemplateId: string): Promise<ScriptMessage[]> => {
  const { data: messages, error } = await supabase
    .from('script_messages')
    .select('*')
    .eq('script_template_id', scriptTemplateId)
    .order('line_number');

  if (error) {
    console.error('Error fetching script messages:', error);
    throw error;
  }

  return messages;
};