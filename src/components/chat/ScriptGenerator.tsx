import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ScriptGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateScripts = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-missing-scripts', {
        body: { 
          topic: 'Food',
          scenarioTitle: 'Ordering at a Restaurant'
        }
      });

      if (error) throw error;

      toast({
        title: 'Script Generation Complete',
        description: `Generated: ${data.generated}, Errors: ${data.errors}`,
        duration: 5000,
      });

      console.log('Generation result:', data);
    } catch (error) {
      console.error('Error generating scripts:', error);
      toast({
        title: 'Error Generating Scripts',
        description: error.message,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <Button 
        onClick={generateScripts} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating Scripts...' : 'Generate Restaurant Scripts'}
      </Button>
    </div>
  );
};

export default ScriptGenerator;