import { supabase } from "@/integrations/supabase/client";

export const handleRestartScenario = async (sessionId: string) => {
  // Delete the current session
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }

  // Reload the page to start fresh
  window.location.reload();
};

export const handleNextScenario = () => {
  // For now, just go back to scenario selection
  window.history.back();
};