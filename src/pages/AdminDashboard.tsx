import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAllScripts = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-missing-scripts', {
        body: {
          generateAll: true
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data?.success) {
        throw new Error(data?.errorDetails?.join('\n') || 'Unknown error occurred during script generation');
      }

      toast({
        title: "Script Generation Started",
        description: `Successfully started generating ${data.generated} scripts. Check the Supabase logs for progress updates.`,
      });

      console.log('Generation response:', data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error generating scripts:', error);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Script generation was stopped due to an error. Check the dashboard for details.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="space-y-8">
        <section className="bg-card rounded-lg p-6 border">
          <h2 className="text-2xl font-semibold mb-4">Script Generation</h2>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Generation Error</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Generate All Scripts</h3>
              <p className="text-muted-foreground mb-4">
                Generate conversation scripts for all 24 supported languages.
              </p>
              <Button 
                onClick={generateAllScripts} 
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? "Generating Scripts..." : "Generate All Scripts"}
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-lg p-6 border">
          <h2 className="text-2xl font-semibold mb-4">Generation Status</h2>
          <p className="text-muted-foreground">
            Check the Supabase Edge Function logs for detailed progress information.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.open('https://supabase.com/dashboard/project/jgxvzzyfjpntsbhxfcjv/functions/generate-missing-scripts/logs', '_blank')}
          >
            View Logs
          </Button>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;