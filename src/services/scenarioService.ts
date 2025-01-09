import { supabase } from "@/integrations/supabase/client";

export const handleRestartScenario = async (sessionId: string) => {
  const { error } = await supabase
    .from('chat_sessions')
    .update({
      messages: [],
      current_line_index: 0
    })
    .eq('id', sessionId);

  if (error) throw error;
};

export const handleNextScenario = () => {
  // Implementation for next scenario
  console.log('Next scenario handler - to be implemented');
};