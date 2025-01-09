import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/constants/languages";
import { useToast } from "@/components/ui/use-toast";

export const InitialLanguageSelect = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>("en-US");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ target_language: selectedLanguage })
        .eq('id', session.user.id);

      if (error) throw error;

      navigate("/topics");
    } catch (error) {
      console.error('Error saving language preference:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save language preference. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value as LanguageCode);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Learning Language</h2>
        <p className="text-gray-600">Select the language you want to learn</p>
      </div>

      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span> {lang.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        className="w-full"
        onClick={handleContinue}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Saving...</span>
          </div>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
};