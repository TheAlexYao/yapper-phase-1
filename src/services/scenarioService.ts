import { supabase } from "@/integrations/supabase/client";

export const handleRestartScenario = async (scenarioId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const { error } = await supabase
    .from('user_scenarios')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
      attempts_count: 0,
      pronunciation_score: 0,
      grammar_score: 0,
      fluency_score: 0,
      vocabulary_score: 0
    })
    .eq('scenario_id', scenarioId)
    .eq('user_id', session.user.id);

  if (error) throw error;
};

export const handleNextScenario = () => {
  // Implementation for next scenario
  console.log('Next scenario handler - to be implemented');
};