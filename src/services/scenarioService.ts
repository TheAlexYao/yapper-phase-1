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

export const handleNextScenario = async (currentScenarioId: string, topicId: string) => {
  try {
    console.log('Finding next scenario for:', { currentScenarioId, topicId });
    
    // Get all scenarios for this topic ordered by title
    const { data: scenarios, error } = await supabase
      .from('default_scenarios')
      .select('id, title')
      .eq('topic', topicId)
      .order('title');

    if (error) throw error;
    
    // Find current scenario index
    const currentIndex = scenarios.findIndex(s => s.id === currentScenarioId);
    
    // Get next scenario (or loop back to first)
    const nextScenario = scenarios[currentIndex + 1] || scenarios[0];
    
    console.log('Next scenario:', nextScenario);
    return nextScenario;
  } catch (error) {
    console.error('Error finding next scenario:', error);
    throw error;
  }
};