import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAllScripts = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-missing-scripts', {
        body: {
          generateAll: true
        }
      });

      if (error) throw error;

      toast({
        title: "Script Generation Started",
        description: "Check the Supabase logs for progress updates.",
      });

      console.log('Generation response:', data);
    } catch (error) {
      console.error('Error generating scripts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start script generation. Check console for details.",
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